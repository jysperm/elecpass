import os from 'os';

import Promise from 'bluebird';
import walk from 'walkdir';
import _ from 'lodash';

export default class PassStore {
  constructor(options) {
    this.options = _.defaults(options, {
      passStorePath: `${os.homedir()}/.password-store`
    });
  }

  loadEntries() {
    return new Promise( (resolve, reject) => {
      const entries = [];

      const events = walk(this.options.passStorePath, {follow_symlinks: true}, function(filename, stat) {
        if (filename.endsWith('.git')) {
          this.ignore(filename);
        }

        if (stat.isFile()) {
          entries.push(filename);
        }
      });

      events.on('end', () => {
        resolve(entries);
      });

      events.on('error', (path, err) => {
        reject(err);
      });
    });
  }
}
