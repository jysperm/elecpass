import childProcess from 'child_process';

import _ from 'lodash';
import Promise from 'bluebird';

export function spawn(command, args, stdin, options) {
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

export function endsWithNewLine(content) {
  return content.endsWith('\n') ? content : `${content}\n`
}
