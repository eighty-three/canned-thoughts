import * as account from '../account/accountModel';
import * as settings from '../settings/settingsModel';
import * as profile from '../profile/profileModel';
import * as follows from './followsModel';

const accountsTable = 'accounts_test';
const followsTable = 'follows_test';

beforeAll(async () => {
  await account.createAccount('dummy1', 'pw1', accountsTable);
  await account.createAccount('dummy2', 'pw1', accountsTable);
});

afterAll(async () => {
  await settings.deleteAccount('dummy1', accountsTable);
  await settings.deleteAccount('dummy2', accountsTable);
});

describe('functions without return values', () => {
  test('follow user', async () => { // updateFollowersCount implicitly tested
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

  test('unfollower user', async () => {
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
});

describe('check if followed', () => {
  test('should fail', async () => {
    expect(await follows.checkIfFollowed('dummy1', 'dummy2', accountsTable, followsTable)).toStrictEqual(null);
  });

  test('should work', async () => {
    expect(await follows.checkIfFollowed('dummy1', 'dummy2', accountsTable, followsTable)).toStrictEqual(null);

    await follows.followUser('dummy1', 'dummy2', accountsTable, followsTable);

    expect(await follows.checkIfFollowed('dummy1', 'dummy2', accountsTable, followsTable)).not.toBe(null);
  });
});
