import * as account from '../account/accountModel';
import * as settings from '../settings/settingsModel';
import * as profile from './profileModel';

describe('testing functions', () => {
  beforeAll(async () => {
    await account.createAccount('dummy1', 'pw1');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
  });

  test('getProfileInfo', async () => {
    const profileInfo = await profile.getProfileInfo('dummy1');

    expect(profileInfo).toMatchObject({
      name: 'dummy1',
      description: null,
      followers: 0
    });

    expect(profileInfo.date).toBeTruthy();
    expect(profileInfo.date).not.toBeFalsy();
  });

  test('getNameAndDescription', async () => {
    expect(await profile.getNameAndDescription('dummy1')).toStrictEqual({
      name: 'dummy1',
      description: null
    });
  });

  test('updateNameAndDescription', async () => {
    expect(await profile.getNameAndDescription('dummy1')).toStrictEqual({
      name: 'dummy1',
      description: null
    });

    await profile.updateNameAndDescription('dummy1', 'newDummy', 'New Description');

    expect(await profile.getNameAndDescription('dummy1')).toStrictEqual({
      name: 'newDummy',
      description: 'New Description'
    });

    await profile.updateNameAndDescription('dummy1', 'backToDummy1', 'Old Description');

    expect(await profile.getNameAndDescription('dummy1')).toStrictEqual({
      name: 'backToDummy1',
      description: 'Old Description'
    });
  });
});
