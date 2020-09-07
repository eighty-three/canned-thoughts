import request from 'supertest';
import http from 'http';
import app from '../app';
const server = http.createServer(app).listen(8090);
const url = '/api/follows';

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
    // https://github.com/facebook/jest/issues/3547
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
    await settings.deleteAccount('dummy2');
  });

  describe('toggle', () => {
    beforeAll(async () => {
      await createAccount('dummy2', '123');
    });

    test('both usernames dont exist', async () => {
      const data = { followerUsername: 'dummy3', followedUsername: 'dummy4' };
      const toggle = await agent.post(`${url}/toggle`).send(data);
    
      expect(toggle.body).toMatchObject({ error: 'Username not found' });
      expect(toggle.status).toStrictEqual(401);
    });
    
    test('one username doesnt exist', async () => {
      const data = { followerUsername: 'dummy1', followedUsername: 'dummy3' };
      const toggle = await agent.post(`${url}/toggle`).send(data);
    
      expect(toggle.body).toMatchObject({ error: 'Username not found' });
      expect(toggle.status).toStrictEqual(401);
    });
    
    test('usernames exist', async () => {
      const data = { followerUsername: 'dummy1', followedUsername: 'dummy2' };
      const toggle = await agent.post(`${url}/toggle`).send(data);
    
      expect(toggle.body).toMatchObject({ message: 'Followed' });
      expect(toggle.status).toStrictEqual(200);
      
      const dataForCheck = { followerUsername: 'dummy1', followedUsername: 'dummy2' };
      const check = await agent.get(`${url}/check`).query(dataForCheck);

      expect(check.body).toStrictEqual(true);
      expect(check.status).toStrictEqual(200);
    });

    test('usernames exist, toggle again', async () => {
      const data = { followerUsername: 'dummy1', followedUsername: 'dummy2' };
      const toggle = await agent.post(`${url}/toggle`).send(data);
    
      expect(toggle.body).not.toMatchObject({ message: 'Followed' });
      expect(toggle.body).toMatchObject({ message: 'Unfollowed' });
      expect(toggle.status).toStrictEqual(200);
    });
  });
});

describe('check', () => {
  test('rejected by validator, incomplete fields', async () => {
    const agent = request(server);
    const data = { followedUsername: 'dummy2' };
    const check = await agent.get(`${url}/check`).query(data);

    expect(check.body).toMatchObject({ error: 'Bad Request' });
    expect(check.status).toStrictEqual(400);
  });

  test('rejected by validator, null request', async () => {
    const agent = request(server);
    const data = {};
    const check = await agent.get(`${url}/check`).query(data);

    expect(check.body).toMatchObject({ error: 'Bad Request' });
    expect(check.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid fields', async () => {
    const agent = request(server);
    const data = { followerUsername: 'dummy1$', followedUsername: 'dummy2' };
    const check = await agent.get(`${url}/check`).query(data);

    expect(check.body).toMatchObject({ error: 'Bad Request' });
    expect(check.status).toStrictEqual(400);
  });

  test('check with two fake accounts', async () => {
    const agent = request(server);
    const data = { followerUsername: 'dummy1', followedUsername: 'dummy2' };
    const check = await agent.get(`${url}/check`).query(data);

    expect(check.body).toStrictEqual(false);
    expect(check.status).toStrictEqual(200);
  });

  test('check with one fake one real', async () => {
    await createAccount('dummy1', '123');

    const agent = request(server);
    const data = { followerUsername: 'dummy1', followedUsername: 'dummy2' };
    const check = await agent.get(`${url}/check`).query(data);

    expect(check.body).toStrictEqual(false);
    expect(check.status).toStrictEqual(200);
  });

  test('check with two real accounts', async () => {
    await createAccount('dummy2', '123');

    const agent = request(server);
    const data = { followerUsername: 'dummy1', followedUsername: 'dummy2' };
    const check = await agent.get(`${url}/check`).query(data);

    expect(check.body).toStrictEqual(false);
    expect(check.status).toStrictEqual(200);
  });
});

describe('toggle', () => {
  test('rejected by validator, incomplete fields', async () => {
    const agent = request(server);
    const data = { followedUsername: 'dummy2' };
    const check = await agent.post(`${url}/toggle`).send(data);

    expect(check.body).toMatchObject({ error: 'Bad Request' });
    expect(check.status).toStrictEqual(400);
  });

  test('rejected by validator, null request', async () => {
    const agent = request(server);
    const data = {};
    const check = await agent.post(`${url}/toggle`).send(data);

    expect(check.body).toMatchObject({ error: 'Bad Request' });
    expect(check.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid fields', async () => {
    const agent = request(server);
    const data = { followerUsername: 'dummy1$', followedUsername: 'dummy2' };
    const check = await agent.post(`${url}/toggle`).send(data);

    expect(check.body).toMatchObject({ error: 'Bad Request' });
    expect(check.status).toStrictEqual(400);
  });

  test('rejected by validator, no auth token', async () => {
    const agent = request(server);
    const data = { followerUsername: 'dummy1', followedUsername: 'dummy2' };
    const check = await agent.post(`${url}/toggle`).send(data);

    expect(check.body).toMatchObject({ error: 'You are not authenticated' });
    expect(check.status).toStrictEqual(401);
  });
});
