import fs from 'fs';
import os from 'os';
import path from 'path';

import _ from 'lodash';
import LRU from 'lru-cache';
import Promise from 'bluebird';
import walk from 'walkdir';

import GPGAdapter from './gpg-adapter';

export default class PassStore {
  constructor(options) {
    this.options = _.defaults(options, {
      passStorePath: `${os.homedir()}/.password-store`
    });

    this.gpgAdapter = new GPGAdapter(options);
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

          return {
            name: relativePath.slice(0, -'.gpg'.length),
            realpath: filename,
            metaInfo: metaInfo,
            relativePath: relativePath
          };
        });
      }));
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
      return parseEntry(body)
    });
  }
}

const realpathCache = LRU();

function resolveRelativePath(from, to) {
  let realpath = realpathCache.get(from);

  if (!realpath) {
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
