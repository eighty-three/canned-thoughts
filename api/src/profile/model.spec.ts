import { createAccount } from '../account/model';
import * as settings from '../settings/model';
import * as profile from './model';

describe('testing functions', () => {
  beforeAll(async () => {
    await createAccount('dummy1', 'pw1');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
  });

  test('getProfileInfo account exists', async () => {
    const profileInfo = await profile.getProfileInfo('dummy1');

    expect(profileInfo).toMatchObject({
      name: 'dummy1',
      description: null,
      followers: 0
    });

    expect(profileInfo?.date).toBeTruthy();
    expect(profileInfo?.date).not.toBeFalsy();
  });

  test('getProfileInfo account doesnt exist', async () => {
    const profileInfo = await profile.getProfileInfo('dummy5');

    expect(profileInfo).toBe(null);
  });

  test('getNameAndDescription', async () => {
    expect(await profile.getNameAndDescription('dummy1')).toStrictEqual({
      name: 'dummy1',
      description: null
    });
  });

  test('getNameAndDescription account doesnt exist', async () => {
    const profileInfo = await profile.getNameAndDescription('dummy5');

    expect(profileInfo).toBe(null);
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
