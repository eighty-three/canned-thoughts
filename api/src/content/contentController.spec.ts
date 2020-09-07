import request from 'supertest';
import http from 'http';
import app from '../app';
const server = http.createServer(app).listen(8090);
const url = '/api/content';

import * as account from '../account/model';
import * as content from './model';

console.log = function() {return;}; // Disable console.logs

beforeAll(async () => {
  await account.createAccount('dummy', '123');
});


afterAll(async () => {
  server.close();
});

describe('getPost', () => {
  beforeAll(async () => {
    await content.createPost('dummy', 'post', 'testurl');
  });

  afterAll(async () => {
    await content.deletePost('testurl');
  });

  test('getPost rejected by validator missing key', async () => {
    const data = { username: 'test_username' };
    const post = await request(server).get(`${url}/getpost`).query(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('getPost rejected by validator invalid username', async () => {
    const data = { username: 'test_username$', url: 'testurl' };
    const post = await request(server).get(`${url}/getpost`).query(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('getPost rejected by validator invalid url', async () => {
    const data = { username: 'dummy', url: 'testurl$' };
    const post = await request(server).get(`${url}/getpost`).query(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('getPost on nonexistent url', async () => {
    const data = { username: 'dummy', url: 'testurl1' };
    const post = await request(server).get(`${url}/getpost`).query(data);

    expect(post.body).toStrictEqual(null);
    expect(post.status).toStrictEqual(200);
  });

  test('getPost works properly', async () => {
    const data = { username: 'dummy', url: 'testurl' };
    const post = await request(server).get(`${url}/getpost`).query(data);

    expect(post.body).toMatchObject({
      post: 'post',
      url: 'testurl',
      tags: null
    });

    expect(post.body.date).toBeTruthy();
    expect(post.status).toStrictEqual(200);
  });
});

describe('getPosts', () => {
  beforeAll(async () => {
    await content.createPost('dummy', 'post', 'testurl');
  });

  afterAll(async () => {
    await content.deletePost('testurl');
  });
});

// getTags
// createPost
// searchPosts
// deletePost
// Complete getPosts
