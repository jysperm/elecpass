import {spawn} from 'child_process';
import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import mkdirp from 'mkdirp-promise';
import Promise from 'bluebird';

import {endsWithNewLine} from './utils';

export default class GPGAdapter {
  constructor(options) {
    this.options = _.defaults(options, {
      gpgBinary: 'gpg',
      gpgParams: ['--yes']
    });

    this.gpgId = Promise.fromCallback( callback => {
      fs.readFile(options.gpgIdFile, callback);
    }).then( buffer => {
      return buffer.toString().trim();
    }).catch(console.error);
  }

  spawnGPG(args, stdin) {
    return new Promise( (resolve, reject) => {
      const gpgProcess = spawn(this.options.gpgBinary, _.concat(this.options.gpgParams, args));

      let stdout = '';
      let stderr = '';

      if (stdin) {
        gpgProcess.stdin.end(stdin);
      }

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
    return this.spawnGPG(['--decrypt', filename]).get('stdout');
  }

  encryptAndWrite(filename, content) {
    return this.gpgId.then( gpgId => {
      return mkdirp(path.dirname(filename)).then( () => {
        return this.spawnGPG(['--encrypt', '-r', gpgId, '-o', filename], endsWithNewLine(content));
      });
    });
  }
}
