import * as content from './contentModel';
import * as account from '../account/accountModel';

beforeAll(async () => {
  await account.createAccount('dummy', '123');
});

describe('testing posts', () => {
  test('createPost with tags', async () => {
    const tags = ['tag1', 'tag2', 'tag3'];
    await content.createPost('dummy', 'post', 'url1', tags);

    expect(await content.checkPostsTagsTable()).toHaveLength(3);
  });

  test('createPost with no tags', async () => {
    await content.createPost('dummy', 'post', 'url2');

    expect(await content.checkPostsTagsTable()).toHaveLength(3);
  });

  test('getPost with tags', async () => {
    expect(await content.getPost('url1')).toMatchObject({
      post: 'post',
      url: 'url1',
      tags: 'tag1|tag2|tag3'
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
        url: 'url3',
        tags: null
      })
    ]));

    expect(await content.getPosts('dummy', 1)).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        post: 'post',
        url: 'url1',
        tags: 'tag1|tag2|tag3'
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

  test('getTag', async () => {
    /* Weird that even if there's an error, the serial count still increases,
     * apparently it adds to the serial count first before checking for conflicts,
     * hence tag_id: 4 (and 5, 7, and 8 below)
     */
    expect(await content.getTag('test_tag')).toStrictEqual({ tag_id: 4 });

    expect(await content.getTag('test_tag2')).toStrictEqual({ tag_id: 5 });

    expect(await content.getTag('test_tag')).toStrictEqual({ tag_id: 4 }); 
    // Adds another count even if no new row is created
  });

  test('deleteTag', async () => {
    expect(await content.getTag('test_tag')).toStrictEqual({ tag_id: 7 });

    await content.deleteTag('test_tag');

    expect(await content.getTag('test_tag')).toStrictEqual({ tag_id: 8 });
  });

  test('createPostTagRelation', async () => {
    //await content.createPostTagRelation(1, 1);
  });
});
