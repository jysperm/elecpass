import EventEmitter from 'events';
import fs from 'fs';
import os from 'os';
import path from 'path';

import _ from 'lodash';
import LRU from 'lru-cache';
import Promise from 'bluebird';
import walk from 'walkdir';

import {endsWithNewLine} from './utils';
import GitAdapter from './git-adapter';
import GPGAdapter from './gpg-adapter';

export default class PassStore extends EventEmitter {
  constructor(options) {
    super();

    this.options = _.defaults(options, {
      passStorePath: `${os.homedir()}/.password-store`,
      disableAutoCommit: false
    });

    try {
      fs.mkdirSync(this.options.passStorePath);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    this.gpgAdapter = new GPGAdapter(_.defaults(this.options, {
      gpgIdFile: path.join(this.options.passStorePath, '.gpg-id')
    }));

    this.gitAdapter = new GitAdapter(this.options);

    this.loadRepoStatus();
  }

  loadEntries() {
    return this.listStoreFiles().then( storeFiles => {
      const metaFiles = storeFiles.filter( filename => {
        return filename.endsWith('.meta');
      });

      return Promise.all(storeFiles.filter( filename => {
        return filename.endsWith('.gpg');
      }).map( filename => {
        return this.loadMetaInfo(metaFiles, filename).then( metaInfo => {
          const relativePath = resolveRelativePath(this.options.passStorePath, filename);
          const name = relativePath.slice(0, -'.gpg'.length);

          return {
            name: name,
            lowerCase: name.toLowerCase(),
            realpath: filename,
            metaInfo: metaInfo,
            relativePath: relativePath
          };
        });
      }));
    });
  }

  loadRepoStatus() {
    this.gitAdapter.getRepoStatus().then( repoStatus => {
      this.emit('repo-status-changed', repoStatus);
    });
  }

  loadMetaInfo(metaFiles, entryFilename) {
    return Promise.try( () => {
      const metaFilename = entryFilename.slice(0, -'.gpg'.length) + '.meta';

      if (_.includes(metaFiles, metaFilename)) {
        return Promise.fromCallback( callback => {
          fs.readFile(metaFilename, callback);
        }).then( buffer => {
          return parseMeta(buffer.toString());
        });
      } else {
        return {};
      }
    })
  }

  listStoreFiles() {
    const {passStorePath} = this.options;

    return new Promise( (resolve, reject) => {
      const files = [];

      const events = walk(passStorePath, {follow_symlinks: true}, function(filename, stat) {
        if (filename.endsWith('.git')) {
          this.ignore(filename);
        }

        if (stat.isFile()) {
          files.push(filename);
        }
      });

      events.on('end', () => {
        resolve(files);
      });

      events.on('error', (path, err) => {
        reject(err);
      });
    });
  }

  decryptEntry({realpath}) {
    return this.gpgAdapter.decryptFile(realpath).then( body => {
      return parseEntry(body);
    });
  }

  encryptAndWriteEntry({name, password, extraInfo, metaInfo}) {
    const entryFilename = path.resolve(path.join(this.options.passStorePath, `${name}.gpg`));
    const metaFilename = path.resolve(path.join(this.options.passStorePath, `${name}.meta`));

    const metaFileContent = encodeMeta(metaInfo);

    return this.gpgAdapter.encryptAndWrite(entryFilename, encodeEntry({password, extraInfo})).then( () => {
      if (metaFileContent) {
        return Promise.fromCallback( callback => {
          fs.writeFile(metaFilename, endsWithNewLine(metaFileContent), callback);
        });
      }
    }).then( () => {
      if (!this.options.disableAutoCommit) {
        return this.gitAdapter.commitFiles(_.compact([
          entryFilename, metaFileContent ? metaFilename : null
        ]), `Update ${name}`);
      }
    }).then( () => {
      return this.loadRepoStatus();
    }).then( () => {
      this.emit('entry-changed', {
        name: name,
        password: password,
        realpath: fs.realpathSync(entryFilename), // TODO: Use fs.realpath instead
        relativePath: `${name}.gpg`,
        extraInfo: extraInfo,
        metaInfo: metaInfo
      });
    });
  }

  removeEntry({name}) {
    const entryFilename = path.join(this.options.passStorePath, `${name}.gpg`);
    const metaFilename = path.join(this.options.passStorePath, `${name}.meta`);

    return Promise.all([entryFilename, metaFilename].map( filename => {
      return Promise.fromCallback( callback => {
        fs.unlink(filename, callback);
      }).catch( err => {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      });
    })).then( () => {
      if (!this.options.disableAutoCommit) {
        return this.gitAdapter.commitFiles([], `Remove ${name}`);
      }
    }).then( () => {
      this.loadRepoStatus();
    }).then( () => {
      this.emit('entry-removed', {name});
    });
  }
}

const realpathCache = LRU();

function resolveRelativePath(from, to) {
  let realpath = realpathCache.get(from);

  if (!realpath) {
    // TODO: Use fs.realpath instead
    realpath = fs.realpathSync(from);
  }

  return path.relative(realpath, to);
}

function parseEntry(body) {
  const [__, password, rest] = body.match(/^([^\n]+)([\S\s]*)/);

  return {
    password: password,
    extraInfo: parseMeta(rest)
  };
}

function parseMeta(body) {
  return _.fromPairs(_.compact(body.split(/\n/).map( line => {
    return line.trim();
  })).map( line => {
    return line.match(/(^\s*[^:]+):\s*(.*)/).slice(1);
  }));
}

function encodeEntry({password, extraInfo}) {
  return `${password}\n` + encodeMeta(extraInfo);
}

function encodeMeta(metaInfo) {
  return _.map(metaInfo, (value, key) => {
    return `${key}: ${value}`
  }).join('\n');
}
