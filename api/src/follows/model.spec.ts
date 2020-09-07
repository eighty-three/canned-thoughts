import { createAccount } from '../account/model';
import * as settings from '../settings/model';
import * as profile from '../profile/model';
import * as follows from './model';

describe('testing functions', () => {
  beforeAll(async () => {
    await createAccount('dummy1', 'pw1');
    await createAccount('dummy2', 'pw1');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
    await settings.deleteAccount('dummy2');
  });

  test('followUser', async () => {
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

  test('checkIfFollowed should fail', async () => {
    expect(await follows.checkIfFollowed('dummy1', 'dummy2')).toStrictEqual(null);
  });

  test('checkIfFollowed should work', async () => {
    expect(await follows.checkIfFollowed('dummy1', 'dummy2')).toStrictEqual(null);

    expect(await profile.getProfileInfo('dummy2')).toEqual(
      expect.objectContaining({
        followers: 0
      })
    );

    await follows.followUser('dummy1', 'dummy2');

    expect(await follows.checkIfFollowed('dummy1', 'dummy2')).not.toBe(null);

    expect(await profile.getProfileInfo('dummy2')).toEqual(
      expect.objectContaining({
        followers: 1
      })
    );
  });
});
