import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import Promise from 'bluebird';

import {spawn} from './utils';

const README = `# My PassStore`;

export default class GitAdapter {
  constructor(options) {
    this.options = _.defaults(options, {
      gitBinary: 'git'
    });
  }

  spawnGit(args, stdin, options) {
    return spawn(this.options.gitBinary, args, stdin, _.defaults(options, {
      cwd: path.resolve(this.options.passStorePath)
    }));
  }

  getRepoStatus() {
    return this.spawnGit(['rev-list', '--count', '--left-right', '@{upstream}...HEAD']).then( ({stdout}) => {
      const [__, behind, ahead] = stdout.match(/(\d+)\s+(\d+)/);

      return {
        isGitRepo: true,
        behind: parseInt(behind),
        ahead: parseInt(ahead)
      };
    }).then( result => {
      return this.spawnGit(['remote', 'get-url', 'origin']).then( ({stdout}) => {
        return _.extend(result, {
          remoteRepo: stdout.trim()
        });
      }).catch( err => {
        if (err.stderr.match(/No such remote/)) {
          return result;
        } else {
          throw err;
        }
      });
    }).catch( err => {
      if (err.stderr.match(/no upstream configured/)) {
        return {
          isGitRepo: true
        };
      } else if (err.stderr.match(/Not a git repository/)) {
        return {
          isGitRepo: false
        };
      } else {
        throw err;
      }
    });
  }

  commitFiles(files, message) {
    return Promise.try( () => {
      if (!_.isEmpty(files)) {
        return this.spawnGit(['add', ...files]);
      }
    }).then( () => {
      this.spawnGit(['commit', '-a', '-m', message]);
    });
  }

  initRepo() {
    return this.spawnGit(['init']).then( () => {
      return Promise.fromCallback( callback => {
        fs.writeFile(path.join(this.options.passStorePath, 'README.md'), README, callback);
      }).then( () => {
        return this.spawnGit(['add', '.']);
      }).then( () => {
        return this.spawnGit(['commit', '-m', ':tada: Init PassStore']);
      });
    });
  }

  setRemoteRepo(remoteRepo) {
    return this.spawnGit(['remote', 'remove', 'origin']).catch( err => {
      console.log('[setRemoteRepo]', err);
    }).then( () => {
      return this.spawnGit(['remote', 'add', '--fetch', '--master', 'master', 'origin', remoteRepo]);
    });
  }

  pullRemote() {
    return this.spawnGit(['pull']);
  }

  pushRemote() {
    return this.spawnGit(['push']);
  }
}
