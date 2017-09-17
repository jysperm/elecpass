import _ from 'lodash';
import Promise from 'bluebird';

import {spawn} from 'child_process';

export default class GPGAdapter {
  constructor(options) {
    this.options = _.defaults(options, {
      gpgBinary: 'gpg'
    });
  }

  spawnGPG(args) {
    return new Promise( (resolve, reject) => {
      const gpgProcess = spawn(this.options.gpgBinary, args);

      let stdout = '';
      let stderr = '';

      gpgProcess.stdout.on('data', data => {
        stdout += data.toString();
      });

      gpgProcess.stderr.on('data', data => {
        stderr += data.toString();
      });

      gpgProcess.on('exit', code => {
        if (code === 0) {
          resolve({code, stdout, stderr});
        } else {
          reject(_.extend(new Error(`GPG failed with non-zero code ${code}`), {code, stdout, stderr}));
        }
      });
    });
  }

  decryptFile(filename) {
    return this.spawnGPG(['--decrypt', filename]);
  }
}
