import _ from 'lodash';
import test from 'ava';

import PassStore from '../src/common/pass-store';

const passStore = new PassStore({
  passStorePath: 'examples',
  disableAutoCommit: true
});

test('loadEntries', t => {
  return passStore.loadEntries().then( entries => {
    const someWebsite = _.find(entries, {name: 'Some/Website'});

    t.deepEqual(someWebsite.metaInfo, {Email: 'jysperm@gmail.com'});
    t.is(someWebsite.relativePath, 'Some/Website.gpg');
  });
});

test('decryptEntry', t => {
  return passStore.loadEntries().then( entries => {
    const someWebsite = _.find(entries, {name: 'Some/Website'});

    return passStore.decryptEntry(someWebsite).then( result => {
      t.deepEqual(result, {password: 'passwd', extraInfo: {PIN: '1234'}});
    });
  });
});

test('encryptAndWriteEntry & removeEntry', t => {
  return passStore.encryptAndWriteEntry({
    name: 'Write/Test', password: '123123', metaInfo: {Email: 'jysperm@gmail.com'}
  }).then( () => {
    return passStore.loadEntries().then( entries => {
      const writeTest = _.find(entries, {name: 'Write/Test'});

      return passStore.decryptEntry(writeTest).then( result => {
        t.is(writeTest.metaInfo.Email, 'jysperm@gmail.com');
        t.is(result.password, '123123');
      });
    }).then( () => {
      return passStore.removeEntry({name: 'Write/Test'});
    }).then( () => {
      return passStore.loadEntries().then( entries => {
        t.falsy(_.find(entries, {name: 'Write/Test'}));
      });
    });
  });
});
