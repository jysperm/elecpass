import fs from 'fs';
import os from 'os';

import _ from 'lodash';
import Promise from 'bluebird';
import rmdir from 'rmdir';
import test from 'ava';

import GitAdapter from '../src/common/git-adapter';

const testRepo = `${os.tmpdir()}/elecpass-repo`

test.before( () => {
  return Promise.promisify(rmdir)(testRepo).catch( err => {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }).then( () => {
    return Promise.promisify(fs.mkdir)(testRepo);
  });
});

test('initRepo', t => {
  const gitAdapter = new GitAdapter({
    passStorePath: testRepo
  });

  return gitAdapter.initRepo().then( () => {
    return Promise.promisify(fs.readFile)(`${testRepo}/README.md`).then( result => {
      t.truthy(result);
    });
  });
});

test('getRepoStatus', t => {
  const gitAdapter = new GitAdapter({
    passStorePath: '.'
  });

  return gitAdapter.getRepoStatus().then( result => {
    t.true(result.isGitRepo);
    t.true(_.isNumber(result.behind));
    t.true(_.isNumber(result.ahead));
  });
})
