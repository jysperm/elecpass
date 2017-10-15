import childProcess from 'child_process';

import _ from 'lodash';
import Chance from 'chance';
import otplib from 'otplib';
import Promise from 'bluebird';

const chance = new Chance();

export function spawn(command, args, stdin, options) {
  console.log('[spawn]', command, ...args);

  return new Promise( (resolve, reject) => {
    const child = childProcess.spawn(command, args, options);

    let stdout = '';
    let stderr = '';

    if (stdin) {
      child.stdin.end(stdin);
    }

    child.stdout.on('data', data => {
      stdout += data.toString();
    });

    child.stderr.on('data', data => {
      stderr += data.toString();
    });

    child.on('exit', code => {
      if (code === 0) {
        resolve({code, stdout, stderr});
      } else {
        reject(_.extend(new Error(`${command} failed with non-zero code ${code}: ${stderr || stdout}`), {
          code, stdout, stderr
        }));
      }
    });
  });
}

export function generateTOTPToken(secret) {
  return otplib.authenticator.generate(secret);
}

export function generatePassword(options) {
  options = _.defaults(options, {
    pool: 'abcdefghjkmnpqrtuvwxyzABCDEFGHJKMNPQRTUVWXYZ2346789!@#$%^&*-+=|?',
    length: 16
  });

  return chance.string(options);
}

export function endsWithNewLine(content) {
  return content.endsWith('\n') ? content : `${content}\n`
}
