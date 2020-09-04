import * as account from '../account/accountModel';
import * as settings from '../settings/settingsModel';
import * as profile from '../profile/profileModel';
import * as follows from './followsModel';

describe('testing functions', () => {
  beforeAll(async () => {
    await account.createAccount('dummy1', 'pw1');
    await account.createAccount('dummy2', 'pw1');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
    await settings.deleteAccount('dummy2');
  });

  test('followUser', async () => { // updateFollowersCount implicitly tested
    expect(await profile.getProfileInfo('dummy2')).toEqual(
      expect.objectContaining({
        followers: 0
      })
    );
    
    await follows.followUser('dummy1', 'dummy2');

    expect(await profile.getProfileInfo('dummy2')).toEqual(
      expect.objectContaining({
        followers: 1
      })
    );

  });

  test('unfollowUser', async () => {
    expect(await profile.getProfileInfo('dummy2')).toEqual(
      expect.objectContaining({
        followers: 1
      })
    );
    
    await follows.unfollowUser('dummy1', 'dummy2');

    expect(await profile.getProfileInfo('dummy2')).toEqual(
      expect.objectContaining({
        followers: 0
      })
    );
  });

  test('updateFollowersCount', async () => {
    const spy = jest.spyOn(follows, 'updateFollowersCount');

    await follows.followUser('dummy1', 'dummy2');

    expect(spy).toHaveBeenCalledTimes(1);

    await follows.unfollowUser('dummy1', 'dummy2');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('checkIfFollowed should fail', async () => {
    expect(await follows.checkIfFollowed('dummy1', 'dummy2')).toStrictEqual(null);
  });

  test('checkIfFollowed should work', async () => {
    expect(await follows.checkIfFollowed('dummy1', 'dummy2')).toStrictEqual(null);

    await follows.followUser('dummy1', 'dummy2');

    expect(await follows.checkIfFollowed('dummy1', 'dummy2')).not.toBe(null);
  });
});
