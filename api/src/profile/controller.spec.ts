import request from 'supertest';
import http from 'http';
import app from '../app';
const server = http.createServer(app).listen(8090);
const url = '/api/profile';

import { createAccount } from '../account/model';
import * as settings from '../settings/model';

console.log = function() {return;}; // Disable console.logs

afterAll(async () => {
  server.close();
});

describe('function calls with authentication', () => {
  const agent = request.agent(server);
  let cookie;

  beforeAll(() =>
    agent
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
      })
  );

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
  });

  describe('update', () => {
    test('username exists', async () => {
      const username = { username: 'dummy1' };
      let profileInfo = await agent.get(`${url}/getinfo`).query(username);

      expect(profileInfo.body).toStrictEqual({ name: 'dummy1', description: null });
      expect(profileInfo.status).toStrictEqual(200);

      const data = { username: 'dummy1', newName: 'dummy2', newDescription: 'hello' };
      const message = await agent.post(`${url}/update`).send(data);

      expect(message.body).toMatchObject({ message: 'Profile successfully updated!' });
      expect(message.status).toStrictEqual(200);

      profileInfo = await agent.get(`${url}/getinfo`).query(username);

      expect(profileInfo.body).not.toStrictEqual({ name: 'dummy1', description: null });
      expect(profileInfo.body).toStrictEqual({ name: 'dummy2', description: 'hello' });
      expect(profileInfo.status).toStrictEqual(200);
    });

    test('update profile with empty description', async () => {
      const username = { username: 'dummy1' };
      const data = { username: 'dummy1', newName: 'dummy2' };
      const message = await agent.post(`${url}/update`).send(data);

      expect(message.body).toMatchObject({ message: 'Profile successfully updated!' });
      expect(message.status).toStrictEqual(200);

      const profileInfo = await agent.get(`${url}/getinfo`).query(username);

      expect(profileInfo.body).not.toStrictEqual({ name: 'dummy2', description: 'hello' });
      expect(profileInfo.body).toStrictEqual({ name: 'dummy2', description: null });
      expect(profileInfo.status).toStrictEqual(200);
    });
  });
});

describe('update', () => {
  beforeAll(async () => {
    await createAccount('dummy1', '123');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
  });

  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const message = await agent.post(`${url}/update`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid field', async () => {
    const data = { username: 'dummy1', newName: 'dummy2', password: '123'};
    const message = await agent.post(`${url}/update`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid value', async () => {
    const data = { username: 'dummy1$', newName: 'dummy2', newDescription: 'hello' };
    const message = await agent.post(`${url}/update`).send(data);

    expect(message.body).toMatchObject({ error: 'Bad Request' });
    expect(message.status).toStrictEqual(400);
  });

  test('valid request, no authentication', async () => {
    const data = { username: 'dummy1', newName: 'dummy2', newDescription: 'hello' };
    const message = await agent.post(`${url}/update`).send(data);

    expect(message.body).toMatchObject({ error: 'You are not authenticated' });
    expect(message.status).toStrictEqual(401);
  });
});

describe('getinfo', () => {
  beforeAll(async () => {
    await createAccount('dummy1', '123');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
  });

  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const profileInfo = await agent.get(`${url}/getinfo`).query(data);

    expect(profileInfo.body).toMatchObject({ error: 'Bad Request' });
    expect(profileInfo.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid field', async () => {
    const data = { password: 'dummy1' };
    const profileInfo = await agent.get(`${url}/getinfo`).query(data);

    expect(profileInfo.body).toMatchObject({ error: 'Bad Request' });
    expect(profileInfo.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid value', async () => {
    const data = { username: 'dummy$' };
    const profileInfo = await agent.get(`${url}/getinfo`).query(data);

    expect(profileInfo.body).toMatchObject({ error: 'Bad Request' });
    expect(profileInfo.status).toStrictEqual(400);
  });

  test('account doesnt exist', async () => {
    const data = { username: 'dummy2' };
    const profileInfo = await agent.get(`${url}/getinfo`).query(data);

    expect(profileInfo.body).toStrictEqual(null);
    expect(profileInfo.status).toStrictEqual(200);
  });

  test('existing account', async () => {
    const data = { username: 'dummy1' };
    const profileInfo = await agent.get(`${url}/getinfo`).query(data);

    expect(profileInfo.body).toStrictEqual({ name: 'dummy1', description: null });
    expect(profileInfo.status).toStrictEqual(200);
  });
});

describe('getall', () => {
  beforeAll(async () => {
    await createAccount('dummy1', '123');
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy1');
  });

  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const profileInfo = await agent.get(`${url}/getall`).query(data);

    expect(profileInfo.body).toMatchObject({ error: 'Bad Request' });
    expect(profileInfo.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid field', async () => {
    const data = { password: 'dummy1' };
    const profileInfo = await agent.get(`${url}/getall`).query(data);

    expect(profileInfo.body).toMatchObject({ error: 'Bad Request' });
    expect(profileInfo.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid value', async () => {
    const data = { username: 'dummy$' };
    const profileInfo = await agent.get(`${url}/getall`).query(data);

    expect(profileInfo.body).toMatchObject({ error: 'Bad Request' });
    expect(profileInfo.status).toStrictEqual(400);
  });

  test('account doesnt exist', async () => {
    const data = { username: 'dummy2' };
    const profileInfo = await agent.get(`${url}/getall`).query(data);

    expect(profileInfo.body).toStrictEqual(null);
    expect(profileInfo.status).toStrictEqual(200);
  });

  test('existing account', async () => {
    const data = { username: 'dummy1' };
    const profileInfo = await agent.get(`${url}/getall`).query(data);

    expect(profileInfo.body).toMatchObject({ 
      name: 'dummy1', 
      description: null,
      followers: 0
    });

    expect(profileInfo.body.date).toBeTruthy();
    expect(profileInfo.body.date).not.toBeFalsy();
    expect(profileInfo.status).toStrictEqual(200);
  });
});
