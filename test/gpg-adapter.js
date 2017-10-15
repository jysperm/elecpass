import fs from 'fs';

import Promise from 'bluebird';
import test from 'ava';

import GPGAdapter from '../public/gpg-adapter';

const gpgAdapter = new GPGAdapter({
  gpgIdFile: `examples/.gpg-id`
});

test('gpgId', t => {
  return gpgAdapter.gpgId().then( id => {
    t.is(id, '5A804BF5');
  });
});

test('decryptFile', t => {
  return gpgAdapter.decryptFile('examples/Samples/oneline.gpg').then( result => {
    t.is(result, 'abc123');
  });
});

test('encryptAndWrite', t => {
  const filename = 'examples/write-test.gpg';

  return gpgAdapter.encryptAndWrite(filename, 'some text').then( () => {
    return gpgAdapter.decryptFile(filename).then( result => {
      t.is(result, 'some text');
    });
  }).finally( () => {
    return Promise.promisify(fs.unlink)(filename);
  });
});
