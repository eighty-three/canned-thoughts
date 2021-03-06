import request from 'supertest';
import http from 'http';
import app from '../app';
const server = http.createServer(app).listen(8090);
const url = '/api/content';

import { createAccount } from '../account/model';
import * as settings from '../settings/model';
import * as follows from '../follows/model';
import * as content from './model';

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
        username: 'dummy',
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
    await settings.deleteAccount('dummy');
  });

  describe('createPost', () => {
    test('it works', async () => {
      expect(await content.getPosts('dummy', 0)).toStrictEqual([]);

      const data = { username: 'dummy', post: 'testpost' };
      const post = await agent.post(`${url}/create`).send(data);

      expect(post.body).toMatchObject({
        username: 'dummy',
        name: 'dummy',
        post: 'testpost',
        tags: null
      });

      expect(post.status).toStrictEqual(200);

      expect(await content.getPosts('dummy', 0)).toEqual(expect.arrayContaining(
        [expect.objectContaining({ post: 'testpost' })]
      ));

      expect(await content.getPosts('dummy', 0)).toHaveLength(1);
    });

    test('it works with tags', async () => {
      const data = { username: 'dummy', post: 'testpost', tags: ['tag1', 'tag2'] };
      const post = await agent.post(`${url}/create`).send(data);

      expect(post.body).toMatchObject({
        username: 'dummy',
        name: 'dummy',
        post: 'testpost',
        tags: ['tag1', 'tag2']
      });

      expect(post.status).toStrictEqual(200);

      const deleteData = { username: 'dummy', url: post.body.url };
      await agent.post(`${url}/delete`).send(deleteData);
    });
  });

  describe('getDashboardPosts', () => {
    beforeAll(async () => {
      await createAccount('dummy2', '123');
      for (let i = 0; i < 12; i++) {
        const username = (i % 2 === 0)
          ? 'dummy'
          : 'dummy2';
        const tags = ['tag1', 'tag2', 'tag3'];

        await content.createPost(username, 'post', `url${i}`, tags);
      }
    });

    test('should work', async () => {
      const data = { username: 'dummy' };
      const posts = await agent.post(`${url}/dashboard`).send(data);

      expect(posts.body).toHaveLength(7);
      expect(posts.status).toStrictEqual(200);
    });

    test('should work with follow', async () => {
      await follows.toggleFollow('dummy', 'dummy2');

      const data = { username: 'dummy' };
      const posts = await agent.post(`${url}/dashboard`).send(data);

      expect(posts.body).toHaveLength(10);
      expect(posts.status).toStrictEqual(200);
    });
  });

  describe('searchPosts', () => {
    beforeAll(async () => {
      for (let i = 12; i < 24; i++) {
        const username = (i % 2 === 0)
          ? 'dummy'
          : 'dummy2';
        const tags = ['tag1'];

        await content.createPost(username, 'post', `url${i}`, tags);
      }
    });

    describe('tags dont exist', () => {
      test('search exclusive all', async () => {
        const options = { userScope: 'all', tagScope: 'exclusive' };

        const data = { username: 'dummy', tags: ['tag4'], options, page: 1 };
        const posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search exclusive followed', async () => {
        const options = { userScope: 'followed', tagScope: 'exclusive' };

        const data = { username: 'dummy', tags: ['tag4'], options, page: 1 };
        const posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search exclusive self', async () => {
        const options = { userScope: 'self', tagScope: 'exclusive' };

        const data = { username: 'dummy', tags: ['tag4'], options, page: 1 };
        const posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search inclusive all', async () => {
        const options = { userScope: 'all', tagScope: 'inclusive' };

        const data = { username: 'dummy', tags: ['tag4'], options, page: 1 };
        const posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search inclusive followed', async () => {
        const options = { userScope: 'followed', tagScope: 'inclusive' };

        const data = { username: 'dummy', tags: ['tag4'], options, page: 1 };
        const posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search inclusive self', async () => {
        const options = { userScope: 'self', tagScope: 'inclusive' };

        const data = { username: 'dummy', tags: ['tag4'], options, page: 1 };
        const posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });
    });

    describe('search exclusive', () => {
      test('search exclusive all, one tag', async () => {
        const options = { userScope: 'all', tagScope: 'exclusive' };

        const data = { username: 'dummy', tags: ['tag1'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1'] })]
          )
        );

        expect(posts.body).not.toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })]
          )
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(2);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search exclusive all, all tags', async () => {
        const options = { userScope: 'all', tagScope: 'exclusive' };

        const data = { username: 'dummy', tags: ['tag1', 'tag2', 'tag3'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })]
          )
        );

        expect(posts.body).not.toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1'] })]
          )
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(2);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search exclusive followed only, one tag', async () => {
        const options = { userScope: 'followed', tagScope: 'exclusive' };

        const data = { username: 'dummy', tags: ['tag1'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(6);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1'] })]
          )
        );

        expect(posts.body).not.toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })]
          )
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search exclusive followed only, all tags', async () => {
        const options = { userScope: 'followed', tagScope: 'exclusive' };

        const data = { username: 'dummy', tags: ['tag1', 'tag2', 'tag3'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(6);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })]
          )
        );

        expect(posts.body).not.toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1'] })]
          )
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search exclusive self only, one tag', async () => {
        const options = { userScope: 'self', tagScope: 'exclusive' };

        const data = { username: 'dummy', tags: ['tag1'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(6);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1'] })]
          )
        );

        expect(posts.body).not.toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })]
          )
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search exclusive self only, all tags', async () => {
        const options = { userScope: 'self', tagScope: 'exclusive' };

        const data = { username: 'dummy', tags: ['tag1', 'tag2', 'tag3'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(6);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })]
          )
        );

        expect(posts.body).not.toEqual(
          expect.arrayContaining(
            [expect.objectContaining({ tags: ['tag1'] })]
          )
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });
    });

    describe('search inclusive', () => {
      test('search inclusive all, one tag', async () => {
        const options = { userScope: 'all', tagScope: 'inclusive' };

        const data = { username: 'dummy', tags: ['tag1'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toEqual( // Page 2 because page 1 consists solely of "all tags"
          expect.arrayContaining(
            [
              expect.objectContaining({ tags: ['tag1'] }),
              expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })
            ]
          )
        );

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(4);
        expect(posts.status).toStrictEqual(200);
      });

      test('search inclusive all, all tags', async () => {
        const options = { userScope: 'all', tagScope: 'inclusive' };

        const data = { username: 'dummy', tags: ['tag1', 'tag2', 'tag3'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toEqual( // Page 2 because page 1 consists solely of "all tags"
          expect.arrayContaining(
            [
              expect.objectContaining({ tags: ['tag1'] }),
              expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })
            ]
          )
        );

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(4);
        expect(posts.status).toStrictEqual(200);
      });

      test('search inclusive followed only, one tag', async () => {
        const options = { userScope: 'followed', tagScope: 'inclusive' };

        const data = { username: 'dummy', tags: ['tag1'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining(
            [
              expect.objectContaining({ tags: ['tag1'] }),
              expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })
            ]
          )
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(2);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search inclusive followed only, all tags', async () => {
        const options = { userScope: 'followed', tagScope: 'inclusive' };

        const data = { username: 'dummy', tags: ['tag1', 'tag2', 'tag3'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining(
            [
              expect.objectContaining({ tags: ['tag1'] }),
              expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })
            ]
          )
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(2);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search inclusive self only, one tag', async () => {
        const options = { userScope: 'self', tagScope: 'inclusive' };

        const data = { username: 'dummy', tags: ['tag1'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ tags: ['tag1'] }),
            expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })
          ])
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(2);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });

      test('search inclusive self only, all tags', async () => {
        const options = { userScope: 'self', tagScope: 'inclusive' };

        const data = { username: 'dummy', tags: ['tag1', 'tag2', 'tag3'], options, page: 1 };
        let posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(11);
        expect(posts.status).toStrictEqual(200);

        expect(posts.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ tags: ['tag1'] }),
            expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] })
          ])
        );

        data.page = 2;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(2);
        expect(posts.status).toStrictEqual(200);

        data.page = 3;
        posts = await agent.post(`${url}/search`).send(data);

        expect(posts.body).toHaveLength(0);
        expect(posts.status).toStrictEqual(200);
      });
    });
  });

  describe('deletePost', () => {
    beforeAll(async () => {
      await content.createPost('dummy', 'post', 'testurl');
    });

    test('it works', async () => {
      expect(await content.getPost('dummy', 'testurl')).toMatchObject({
        post: 'post',
        url: 'testurl',
        tags: null
      });

      const data = { username: 'dummy', url: 'testurl' };
      const post = await agent.post(`${url}/delete`).send(data);

      expect(await content.getPost('dummy', 'testurl')).toStrictEqual(null);
    
      expect(post.body).toMatchObject({ message: 'Post deleted' });
      expect(post.status).toStrictEqual(200);
    });
  });
});

describe('getPost', () => {
  beforeAll(async () => {
    await createAccount('dummy', '123');
    await content.createPost('dummy', 'post', 'testurl');
  });

  afterAll(async () => {
    await content.deletePost('testurl');
    await settings.deleteAccount('dummy');
  });

  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const post = await agent.get(`${url}/getpost`).query(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('rejected by validator, incomplete fields', async () => {
    const data = { username: 'dummy' };
    const post = await agent.get(`${url}/getpost`).query(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid field', async () => {
    const data = { username: 'dummy', password: '123' };
    const posts = await agent.get(`${url}/getpost`).query(data);

    expect(posts.body).toMatchObject({ error: 'Bad Request' });
    expect(posts.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid values', async () => {
    const data = { username: 'dummy$', url: 'testurl' };
    const post = await agent.get(`${url}/getpost`).query(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('getPost on nonexistent url', async () => {
    const data = { username: 'dummy', url: 'testurl1' };
    const post = await agent.get(`${url}/getpost`).query(data);

    expect(post.body).toStrictEqual(null);
    expect(post.status).toStrictEqual(200);
  });

  test('getPost works properly', async () => {
    const data = { username: 'dummy', url: 'testurl' };
    const post = await agent.get(`${url}/getpost`).query(data);

    expect(post.body).toMatchObject({
      username: 'dummy',
      name: 'dummy',
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
    await createAccount('dummy', '123');
    for (let i = 0; i < 13; i++) {
      await content.createPost('dummy', 'post', `testurl${i}`);
    }
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy');
  });

  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const posts = await agent.get(`${url}/getallposts`).query(data);

    expect(posts.body).toMatchObject({ error: 'Bad Request' });
    expect(posts.status).toStrictEqual(400);
  });

  test('rejected by validator, incomplete fields', async () => {
    const data = { username: 'dummy' };
    const posts = await agent.get(`${url}/getallposts`).query(data);

    expect(posts.body).toMatchObject({ error: 'Bad Request' });
    expect(posts.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid field', async () => {
    const data = { username: 'dummy', password: '123' };
    const posts = await agent.get(`${url}/getallposts`).query(data);

    expect(posts.body).toMatchObject({ error: 'Bad Request' });
    expect(posts.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid value', async () => {
    const data = { username: 'dummy$', page: 1 };
    const posts = await agent.get(`${url}/getallposts`).query(data);

    expect(posts.body).toMatchObject({ error: 'Bad Request' });
    expect(posts.status).toStrictEqual(400);
  });

  test('getPosts on nonexistent username', async () => {
    const data = { username: 'dummy1', page: 1 };
    const posts = await agent.get(`${url}/getallposts`).query(data);

    expect(posts.body).toStrictEqual([]);
    expect(posts.status).toStrictEqual(200);
  });

  test('getPosts page 1', async () => {
    const data = { username: 'dummy', page: 1 };
    const posts = await agent.get(`${url}/getallposts`).query(data);

    expect(posts.body).toHaveLength(11);
    expect(posts.status).toStrictEqual(200);
  });

  test('getPosts page 2', async () => {
    const data = { username: 'dummy', page: 2 };
    const posts = await agent.get(`${url}/getallposts`).query(data);

    expect(posts.body).toHaveLength(3);
    expect(posts.status).toStrictEqual(200);
  });
});

describe('deletePost', () => {
  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const post = await agent.post(`${url}/delete`).send(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('rejected by validator, incomplete fields', async () => {
    const data = { username: 'dummy' };
    const post = await agent.post(`${url}/delete`).send(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid fields', async () => {
    const data = { username: 'dummy', password: '123' };
    const post = await agent.post(`${url}/delete`).send(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid values', async () => {
    const data = { username: 'dummy$', url: 'testurl' };
    const post = await agent.post(`${url}/delete`).send(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('valid request, no authentication', async () => {
    const data = { username: 'dummy', url: 'testurl' };
    const post = await agent.post(`${url}/delete`).send(data);

    expect(post.body).toMatchObject({error: 'You are not authenticated'});
    expect(post.status).toStrictEqual(401);
  });
});

describe('createPost', () => {
  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('rejected by validator, incomplete fields', async () => {
    const data = { username: 'dummy' };
    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid fields', async () => {
    const data = { username: 'dummy', password: '123' };
    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid values', async () => {
    const data = { username: 'dummy$', post: 'testpost' };
    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({error: 'Bad Request'});
    expect(post.status).toStrictEqual(400);
  });

  test('valid request, no authentication', async () => {
    const data = { username: 'dummy', post: 'testpost' };
    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({error: 'You are not authenticated'});
    expect(post.status).toStrictEqual(401);
  });
});

describe('searchPosts', () => {
  const agent = request(server);
  const tags = ['tag1', 'tag2', 'tag3'];

  test('rejected by validator, null data', async () => {
    const data = {};
    const posts = await agent.post(`${url}/search`).send(data);

    expect(posts.body).toMatchObject({error: 'Bad Request'});
    expect(posts.status).toStrictEqual(400);
  });

  test('rejected by validator, incomplete fields', async () => {
    const data = { username: 'dummy' };
    const posts = await agent.post(`${url}/search`).send(data);

    expect(posts.body).toMatchObject({error: 'Bad Request'});
    expect(posts.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid fields', async () => {
    const data = { username: 'dummy', tags, password: '123', page: 1 };
    const posts = await agent.post(`${url}/search`).send(data);

    expect(posts.body).toMatchObject({error: 'Bad Request'});
    expect(posts.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid values', async () => {
    const options = {
      scope: 'inexclusive',
      followedOnly: true
    };

    const data = { username: 'dummy', tags, options, page: 2 };
    const posts = await agent.post(`${url}/search`).send(data);

    expect(posts.body).toMatchObject({error: 'Bad Request'});
    expect(posts.status).toStrictEqual(400);
  });

  test('valid request, no authentication', async () => {
    const options = {
      userScope: 'followed',
      tagScope: 'inclusive'
    };

    const data = { username: 'dummy', tags, options, page: 2 };
    const posts = await agent.post(`${url}/search`).send(data);

    expect(posts.body).toMatchObject({error: 'You are not authenticated'});
    expect(posts.status).toStrictEqual(401);
  });
});

describe('getDashboardPosts', () => {
  const agent = request(server);

  test('rejected by validator, null data', async () => {
    const data = {};
    const posts = await agent.post(`${url}/dashboard`).send(data);

    expect(posts.body).toMatchObject({error: 'Bad Request'});
    expect(posts.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid fields', async () => {
    const data = { password: '123' };
    const posts = await agent.post(`${url}/dashboard`).send(data);

    expect(posts.body).toMatchObject({error: 'Bad Request'});
    expect(posts.status).toStrictEqual(400);
  });

  test('rejected by validator, invalid values', async () => {
    const data = { username: 'dummy$' };
    const posts = await agent.post(`${url}/dashboard`).send(data);

    expect(posts.body).toMatchObject({error: 'Bad Request'});
    expect(posts.status).toStrictEqual(400);
  });

  test('valid request, no authentication', async () => {
    const data = { username: 'dummy' };
    const posts = await agent.post(`${url}/dashboard`).send(data);

    expect(posts.body).toMatchObject({error: 'You are not authenticated'});
    expect(posts.status).toStrictEqual(401);
  });
});
