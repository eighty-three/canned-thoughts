import * as account from './accountModel';

describe('create account', () => {
  test('should always work because the checks/validations are done beforehand', async () => {
    expect(await account.checkUsername('dummy')).toBe(null);

    await account.createAccount('dummy', 'password123');

    const check = await account.checkUsername('dummy');
    expect(check).toStrictEqual({ username: 'dummy' });
  });
});

describe('check username', () => {
  test('should fail', async () => {
    const user = await account.checkUsername('test');
    expect(user).toStrictEqual(null);
  });
  
  test('should work', async () => {
    const user = await account.checkUsername('dummy');
    expect(user).toStrictEqual({ username: 'dummy' });
  });
});

describe('check password', () => {
  test('should fail', async () => {
    const user = await account.checkPassword('test');
    expect(user).toStrictEqual(null);
  });
  
  test('should work', async () => {
    const user = await account.checkPassword('dummy');
    expect(user).toStrictEqual({ password: 'password123' });
  });
});
