import * as account from './accountModel';
import * as settings from '../settings/settingsModel';

const testTable = 'accounts_test';

afterAll(async () => {
  await settings.deleteAccount('dummy', testTable);
});

describe('create account', () => {
  test('should always work because the checks/validations are done beforehand', async () => {
    expect(await account.checkUsername('dummy')).toBe(null);

    await account.createAccount('dummy', 'password123', testTable);

    const check = await account.checkUsername('dummy', testTable);
    expect(check).toStrictEqual({ username: 'dummy' });
  });
});

describe('check username', () => {
  test('should fail', async () => {
    const user = await account.checkUsername('test', testTable);
    expect(user).toStrictEqual(null);
  });
  
  test('should work', async () => {
    const user = await account.checkUsername('dummy', testTable);
    expect(user).toStrictEqual({ username: 'dummy' });
  });
});

describe('check password', () => {
  test('should fail', async () => {
    const user = await account.checkPassword('test', testTable);
    expect(user).toStrictEqual(null);
  });
  
  test('should work', async () => {
    const user = await account.checkPassword('dummy', testTable);
    expect(user).toStrictEqual({ password: 'password123' });
  });
});
