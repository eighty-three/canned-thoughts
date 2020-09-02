import * as account from '../account/accountModel';
import * as settings from '../settings/settingsModel';
import * as profile from '../profile/profileModel';
import * as follows from './followsModel';

const accountsTable = 'accounts_test';
const followsTable = 'follows_test';

describe('testing functions', () => {
  beforeAll(async () => {
    await account.createAccount('dummy1', 'pw1', accountsTable);
    await account.createAccount('dummy2', 'pw1', accountsTable);
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1', accountsTable);
    await settings.deleteAccount('dummy2', accountsTable);
  });

  test('followUser', async () => { // updateFollowersCount implicitly tested
    expect(await profile.getProfileInfo('dummy2', accountsTable)).toEqual(
      expect.objectContaining({
        followers: 0
      })
    );
    
    await follows.followUser('dummy1', 'dummy2', accountsTable, followsTable);

    expect(await profile.getProfileInfo('dummy2', accountsTable)).toEqual(
      expect.objectContaining({
        followers: 1
      })
    );
  });

  test('unfollowUser', async () => {
    expect(await profile.getProfileInfo('dummy2', accountsTable)).toEqual(
      expect.objectContaining({
        followers: 1
      })
    );
    
    await follows.unfollowUser('dummy1', 'dummy2', accountsTable, followsTable);

    expect(await profile.getProfileInfo('dummy2', accountsTable)).toEqual(
      expect.objectContaining({
        followers: 0
      })
    );
  });

  test('checkIfFollowed should fail', async () => {
    expect(await follows.checkIfFollowed('dummy1', 'dummy2', accountsTable, followsTable)).toStrictEqual(null);
  });

  test('checkIfFOllowed should work', async () => {
    expect(await follows.checkIfFollowed('dummy1', 'dummy2', accountsTable, followsTable)).toStrictEqual(null);

    await follows.followUser('dummy1', 'dummy2', accountsTable, followsTable);

    expect(await follows.checkIfFollowed('dummy1', 'dummy2', accountsTable, followsTable)).not.toBe(null);
  });
});
