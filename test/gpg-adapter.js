import os from 'os';

import test from 'ava';

import GPGAdapter from '../public/gpg-adapter';

const gpgAdapter = new GPGAdapter({
  gpgIdFile: `${os.homedir()}/.password-store/.gpg-id`
});

test('decryptFile', t => {
  return gpgAdapter.decryptFile('examples/Samples/oneline.gpg').then( result => {
    t.is(result, 'abc123');
  });
});
