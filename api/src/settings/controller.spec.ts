import request, { SuperTest, Test } from 'supertest';
import http from 'http';
import app from '../app';
const server = http.createServer(app).listen(8090);
const url = '/api/settings';

import * as authAccount from '@authMiddleware/accountModel';
import { createAccount } from '../account/model';
import * as settings from './model';

console.log = function() {return;}; // Disable console.logs

afterAll(async () => {
  server.close();
});

describe('function calls with authentication', () => {
  let cookie;
  let agent: SuperTest<Test>;

  beforeEach(async () => {
    agent = request.agent(server);  
    /* Need to reinitialize the agent to use a different token to fix
     * errors about setting headers after they are sent to client
     */
    return agent
      .post('/api/account/signup')
      .send({
        username: 'dummy1',
        password: '123',
      })
      .expect(200)
      .then((res) => {
        const cookies = res.header['set-cookie'][0].split(',')
          .map((item: string) => item.split(';')[0]);
        cookie = cookies.join(';');
        console.log(cookie);
      });
  });

  afterEach(async () => {
    await settings.deleteAccount('dummy1');
    await settings.deleteAccount('dummy2');
    await settings.deleteAccount('dummy3');
  });

  describe('change username', () => {
    test('invalid password', async () => {
      const data = { username: 'dummy1', newUsername: 'dummy2', password: '1234' };
      const message = await agent.post(`${url}/username`).send(data);

      expect(message.body).toMatchObject({ error: 'Invalid password' });
      expect(message.status).toStrictEqual(401);
    });

    test('username already taken', async () => {
      await createAccount('dummy2', '123');

      const data = { username: 'dummy1', newUsername: 'dummy2', password: '123' };
      const message = await agent.post(`${url}/username`).send(data);

      expect(message.body).toMatchObject({ error: 'Username already taken' });
      expect(message.status).toStrictEqual(409);
    });

    test('success', async () => {
      expect(await authAccount.checkUsername('dummy1')).toStrictEqual({ username: 'dummy1' });
      expect(await authAccount.checkUsername('dummy3')).toStrictEqual(null);

      const data = { username: 'dummy1', newUsername: 'dummy3', password: '123' };
      const message = await agent.post(`${url}/username`).send(data);

      expect(message.body).toMatchObject({ message: 'Username successfully changed!' });
      expect(message.status).toStrictEqual(200);

      expect(await authAccount.checkUsername('dummy1')).not.toStrictEqual({ username: 'dummy1' });
      expect(await authAccount.checkUsername('dummy3')).not.toStrictEqual(null);
      expect(await authAccount.checkUsername('dummy3')).toStrictEqual({ username: 'dummy3' });
    });
  });
  
  describe('change password', () => {
    test('invalid password', async () => {
      const data = { username: 'dummy1', password: '1234', newPassword: '456' };
      const message = await agent.post(`${url}/password`).send(data);

      expect(message.body).toMatchObject({ error: 'Invalid password' });
      expect(message.status).toStrictEqual(401);
    });

    test('success', async () => {
      const data = { username: 'dummy1', password: '123', newPassword: '456' };
      const message = await agent.post(`${url}/password`).send(data);

      expect(message.body).toMatchObject({ message: 'Password successfully changed!' });
      expect(message.status).toStrictEqual(200);

      const oldData = { username: 'dummy1', password: '123' };
      const check = await agent.post(`${url}/delete`).send(oldData);

      expect(check.body).toMatchObject({ error: 'Invalid password' });
      expect(check.status).toStrictEqual(401);
    });
  });

  describe('delete account', () => {
    test('invalid password', async () => {
      const data = { username: 'dummy1', password: '1234' };
      const message = await agent.post(`${url}/delete`).send(data);

      expect(message.body).toMatchObject({ error: 'Invalid password' });
      expect(message.status).toStrictEqual(401);
    });
    
    test('success', async () => {
      expect(await authAccount.checkUsername('dummy1')).toStrictEqual({ username: 'dummy1' });

      const data = { username: 'dummy1', password: '123' };
      const message = await agent.post(`${url}/delete`).send(data);

      expect(message.body).toMatchObject({ message: 'Account successfully deleted!' });
      expect(message.status).toStrictEqual(200);

      expect(await authAccount.checkUsername('dummy1')).not.toStrictEqual({ username: 'dummy1' });
      expect(await authAccount.checkUsername('dummy1')).toStrictEqual(null);
    });
  });
});

describe('change username', () => {
  beforeAll(async () => {
    await createAccount('dummy1', '123');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
  });

  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const message = await agent.post(`${url}/username`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, incomplete fields', async () => {
    const data = { username: 'dummy1', password: '123' };
    const message = await agent.post(`${url}/username`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid fields', async () => {
    const data = { username: 'dummy1', oldUsername: 'dummy2', password: '123' };
    const message = await agent.post(`${url}/username`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid data', async () => {
    const data = { username: 'dummy1$', newUsername: 'dummy2', password: '123' };
    const message = await agent.post(`${url}/username`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('valid request, no authentication', async () => {
    const data = { username: 'dummy1', newUsername: 'dummy2', password: '123' };
    const message = await agent.post(`${url}/username`).send(data);

    expect(message.body).toMatchObject({ error: 'You are not authenticated' });
    expect(message.status).toStrictEqual(401);
  });
});

describe('change password', () => {
  beforeAll(async () => {
    await createAccount('dummy1', '123');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
  });

  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const message = await agent.post(`${url}/password`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, incomplete fields', async () => {
    const data = { username: 'dummy1', password: '123' };
    const message = await agent.post(`${url}/password`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid fields', async () => {
    const data = { username: 'dummy1', password: '123', oldPassword: '456' };
    const message = await agent.post(`${url}/password`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid data', async () => {
    const data = { username: 'dummy1', password: '123', newPassword: 456 };
    const message = await agent.post(`${url}/password`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('valid request, no authentication', async () => {
    const data = { username: 'dummy1', password: '123', newPassword: '456' };
    const message = await agent.post(`${url}/password`).send(data);

    expect(message.body).toMatchObject({ error: 'You are not authenticated' });
    expect(message.status).toStrictEqual(401);
  });
});

describe('delete account', () => {
  beforeAll(async () => {
    await createAccount('dummy1', '123');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
  });

  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const message = await agent.post(`${url}/delete`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, incomplete fields', async () => {
    const data = { username: 'dummy1' };
    const message = await agent.post(`${url}/delete`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid fields', async () => {
    const data = { username: 'dummy1', oldPassword: '123' };
    const message = await agent.post(`${url}/delete`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid data', async () => {
    const data = { username: 'dummy1', password: 123 };
    const message = await agent.post(`${url}/delete`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('valid request, no authentication', async () => {
    const data = { username: 'dummy1', password: '123' };
    const message = await agent.post(`${url}/delete`).send(data);

    expect(message.body).toMatchObject({ error: 'You are not authenticated' });
    expect(message.status).toStrictEqual(401);
  });
});
