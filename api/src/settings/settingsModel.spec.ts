import * as account from '../account/accountModel';
import * as settings from './settingsModel';

const testTable = 'accounts_test';

beforeAll(async () => {
  await account.createAccount('dummy1', 'pw1', testTable);
});

describe('testing functions', () => {
  test('change password', async () => {
    expect(await account.checkPassword('dummy1', testTable)).toStrictEqual({ password: 'pw1' });

    await settings.changePassword('dummy1', 'pw3', testTable);

    expect(await account.checkPassword('dummy1', testTable)).not.toStrictEqual({ password: 'pw1' });
    expect(await account.checkPassword('dummy1', testTable)).toStrictEqual({ password: 'pw3' });
  });

  test('change username', async () => {
    expect(await account.checkUsername('dummy1', testTable)).toStrictEqual({ username: 'dummy1' });
    expect(await account.checkUsername('dummy2', testTable)).toStrictEqual(null);

    await settings.changeUsername('dummy1', 'dummy2', testTable);

    expect(await account.checkUsername('dummy1', testTable)).toStrictEqual(null);
    expect(await account.checkUsername('dummy2', testTable)).toStrictEqual({ username: 'dummy2' });
  });

  test('delete account', async () => {
    expect(await account.checkUsername('dummy2', testTable)).toStrictEqual({ username: 'dummy2' });

    await settings.deleteAccount('dummy2', testTable);

    expect(await account.checkUsername('dummy2', testTable)).toStrictEqual(null);
  });
});
