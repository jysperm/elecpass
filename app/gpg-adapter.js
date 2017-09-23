import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import mkdirp from 'mkdirp-promise';
import Promise from 'bluebird';

import {endsWithNewLine, spawn} from './utils';

export default class GPGAdapter {
  constructor(options) {
    this.options = _.defaults(options, {
      gpgBinary: 'gpg',
      gpgParams: ['--yes']
    });
  }

  gpgId() {
    return Promise.fromCallback( callback => {
      fs.readFile(this.options.gpgIdFile, callback);
    }).then( buffer => {
      return buffer.toString().trim();
    });
  }

  setGPGId(gpgId) {
    return Promise.fromCallback( callback => {
      fs.writeFile(this.options.gpgIdFile, endsWithNewLine(gpgId), callback);
    });
  }

  spawnGPG(args, stdin, options) {
    return spawn(this.options.gpgBinary, _.concat(this.options.gpgParams, args), stdin, options);
  }

  decryptFile(filename) {
    return this.spawnGPG(['--decrypt', filename]).then( ({stdout}) => {
      return stdout.trim();
    });
  }

  encryptAndWrite(filename, content) {
    return this.gpgId.then( gpgId => {
      return mkdirp(path.dirname(filename)).then( () => {
        return this.spawnGPG(['--encrypt', '-r', gpgId, '-o', filename], endsWithNewLine(content));
      });
    });
  }
}
