import * as content from './contentModel';
import * as account from '../account/accountModel';

beforeAll(async () => {
  await account.createAccount('dummy', '123');
});

describe('testing posts', () => {
  test('createPost with tags', async () => {
    const tags = ['1', '2', '3'];
    expect(await content.createPost('dummy', 'post', 'url1', tags)).toStrictEqual({post_id: 1});
  });

  test('createPost with no tags', async () => {
    expect(await content.createPost('dummy', 'post', 'url2')).toStrictEqual({post_id: 2});
  });

  test('getPost with tags', async () => {
    expect(await content.getPost('url1')).toMatchObject({
      post: 'post',
      url: 'url1',
      tags: '1|2|3'
    });
  });

  test('getPost with no tags', async () => {
    expect(await content.getPost('url2')).toMatchObject({
      post: 'post',
      url: 'url2',
      tags: null
    });
  });

  test('getPosts offset', async () => {
    await content.createPost('dummy', 'post', 'url3');

    expect(await content.getPosts('dummy', 0)).toHaveLength(3);
    expect(await content.getPosts('dummy', 1)).toHaveLength(2);
  });

  test('getPosts contains correct data', async () => {
    expect(await content.getPosts('dummy', 1)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        post: 'post',
        tags: null,
        url: 'url3'
      })
    ]));

    expect(await content.getPosts('dummy', 1)).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        post: 'post',
        tags: '1|2|3',
        url: 'url1'
      })
    ]));
  });

  test('deletePost', async () => {
    expect(await content.getPosts('dummy', 0)).toHaveLength(3);

    await content.deletePost('url1');

    expect(await content.getPosts('dummy', 0)).toHaveLength(2);

    await content.deletePost('url2');

    expect(await content.getPosts('dummy', 0)).toHaveLength(1);
  });
});

describe('testing tags', () => {
  beforeEach(async () => {
    await content.deleteTag('test_tag');
  });

  test('createTag', async () => {
    expect(await content.checkTag('test_tag')).toStrictEqual(null);

    expect(await content.createTag('test_tag')).toStrictEqual({ tag_id: 1 });

    expect(await content.checkTag('test_tag')).toStrictEqual({ tag_id: 1 });
  });

  test('checkTag', async () => {
    expect(await content.checkTag('test_tag')).toStrictEqual(null);

    expect(await content.createTag('test_tag')).toStrictEqual({ tag_id: 2 }); // Because of the serial

    expect(await content.checkTag('diff_tag')).toStrictEqual(null);
    expect(await content.checkTag('test_tag')).toStrictEqual({ tag_id: 2 });
  });

  test('deleteTag', async () => {
    expect(await content.checkTag('test_tag')).toStrictEqual(null);

    expect(await content.createTag('test_tag')).toStrictEqual({ tag_id: 3 });

    expect(await content.checkTag('diff_tag')).toStrictEqual(null);
    expect(await content.checkTag('test_tag')).toStrictEqual({ tag_id: 3 });

    await content.deleteTag('test_tag');

    expect(await content.checkTag('test_tag')).toStrictEqual(null);
  });

  test('createPostTagRelation', async () => {
    //await content.createPostTagRelation(1, 1);
  });
});
