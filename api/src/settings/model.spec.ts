import * as account from '../account/model';
import * as settings from './model';

describe('testing functions', () => {
  beforeAll(async () => {
    await account.createAccount('dummy1', 'pw1');
  });

  test('change password', async () => {
    expect(await account.checkPassword('dummy1')).toStrictEqual({ password: 'pw1' });

    await settings.changePassword('dummy1', 'pw3');

    expect(await account.checkPassword('dummy1')).not.toStrictEqual({ password: 'pw1' });
    expect(await account.checkPassword('dummy1')).toStrictEqual({ password: 'pw3' });
  });

  test('change username', async () => {
    expect(await account.checkUsername('dummy1')).toStrictEqual({ username: 'dummy1' });
    expect(await account.checkUsername('dummy2')).toStrictEqual(null);

    await settings.changeUsername('dummy1', 'dummy2');

    expect(await account.checkUsername('dummy1')).toStrictEqual(null);
    expect(await account.checkUsername('dummy2')).toStrictEqual({ username: 'dummy2' });
  });

  test('delete account', async () => {
    expect(await account.checkUsername('dummy2')).toStrictEqual({ username: 'dummy2' });

    await settings.deleteAccount('dummy2');

    expect(await account.checkUsername('dummy2')).toStrictEqual(null);
  });
});
