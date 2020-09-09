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
    expect(await profile.getProfileInfo('dummy2', 'dummy1')).toEqual(
      expect.objectContaining({
        followers: 0,
        followStatus: false
      })
    );
    
    await follows.toggleFollow('dummy1', 'dummy2');

    expect(await profile.getProfileInfo('dummy2', 'dummy1')).toEqual(
      expect.objectContaining({
        followers: 1,
        followStatus: true
      })
    );

  });

  test('unfollowUser', async () => {
    expect(await profile.getProfileInfo('dummy2', 'dummy1')).toEqual(
      expect.objectContaining({
        followers: 1,
        followStatus: true
      })
    );
    
    await follows.toggleFollow('dummy1', 'dummy2');

    expect(await profile.getProfileInfo('dummy2', 'dummy1')).toEqual(
      expect.objectContaining({
        followers: 0,
        followStatus: false
      })
    );
  });
});
