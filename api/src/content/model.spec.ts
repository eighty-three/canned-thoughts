import * as content from './model';
import { createAccount } from '../account/model';
import * as follows from '../follows/model';
import * as settings from '../settings/model';
import { IOptions } from './types';

beforeAll(async () => {
  await createAccount('dummy', '123');
  await createAccount('dummy2', '123');
});

describe('testing posts', () => {
  test('createPost with tags', async () => {
    const tags = ['tag1', 'tag2', 'tag3'];
    const newPost = await content.createPost('dummy', 'post', 'url1', tags);

    expect(newPost).toMatchObject({
      username: 'dummy',
      name: 'dummy',
      tags, // same as input instead of having to do any string manipulation
      post: 'post',
      url: 'url1'
    });

    expect(await content.checkPostsTagsTable()).toHaveLength(1);
  });

  test('createPost with no tags', async () => {
    expect(await content.getPosts('dummy', 0)).toHaveLength(1);

    const newPost = await content.createPost('dummy', 'post', 'url2');

    expect(newPost).toMatchObject({
      username: 'dummy',
      name: 'dummy',
      post: 'post',
      url: 'url2'
    });

    expect(await content.checkPostsTagsTable()).toHaveLength(1);

    expect(await content.getPosts('dummy', 0)).toHaveLength(2);
  });

  test('getPost with tags', async () => {
    const tags = ['tag1', 'tag2', 'tag3'];

    expect(await content.getPost('dummy', 'url1')).toMatchObject({
      username: 'dummy',
      name: 'dummy',
      post: 'post',
      url: 'url1',
      tags // same as input instead of having to do any string manipulation
    });
  });

  test('getPost with no tags', async () => {
    expect(await content.getPost('dummy', 'url2')).toMatchObject({
      username: 'dummy',
      name: 'dummy',
      post: 'post',
      url: 'url2',
      tags: null
    });
  });

  test('getPost with nonexistent url but valid username', async () => {
    expect(await content.getPost('dummy', 'url_doesnt_exist')).toStrictEqual(null);
  });

  test('getPost with nonexistent url and nonexistent username', async () => {
    expect(await content.getPost('user_doesnt_exist', 'url_doesnt_exist')).toStrictEqual(null);
  });

  test('getPost with valid url but nonexistent username', async () => {
    expect(await content.getPost('user_doesnt_exist', 'url1')).toStrictEqual(null);
  });

  test('getPosts offset', async () => {
    await content.createPost('dummy', 'post', 'url3');

    expect(await content.getPosts('dummy', 0)).toHaveLength(3);
    expect(await content.getPosts('dummy', 1)).toHaveLength(2);
  });

  test('getPosts contains correct data', async () => {
    expect(await content.getPosts('dummy', 1)).toEqual(expect.arrayContaining([
      expect.objectContaining({ url: 'url2' })
    ]));

    expect(await content.getPosts('dummy', 1)).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ url: 'url3' })
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
  afterEach(async () => {
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
});


describe('searchPosts', () => {
  const tags = ['test_tag', 'new_tag'];
  beforeAll(async () => {
    for (let i = 0; i < 20; i++) {
      const user = (i < 10)
        ? 'dummy'
        : 'dummy2';

      await content.createPost(user, 'post', `test${String(i)}`, tags);
    }
  });

  afterAll(async () => {
    await settings.deleteAccount('dummy');
    await settings.deleteAccount('dummy2');
  });


  test('searchPostsWithTags search-inclusive-all', async () => {
    expect(await content.getTag('test_tag')).toStrictEqual({ tag_id: 9 });
    expect(await content.getTag('new_tag')).toStrictEqual({ tag_id: 10 });

    const options: IOptions = {
      userScope: 'all',
      tagScope: 'inclusive'
    };

    expect(await content.searchPostsWithTags('dummy', tags, options, 0)).toHaveLength(11);
    expect(await content.searchPostsWithTags('dummy', tags, options, 5)).toHaveLength(11);
    expect(await content.searchPostsWithTags('dummy', tags, options, 11)).toHaveLength(9);

    expect(await content.searchPostsWithTags('dummy', ['test_tag'], options, 0)).toHaveLength(11);
    expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 0)).toHaveLength(11);
    expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 11)).toHaveLength(9);
  });

  test('searchPostsWithTags search-inclusive-self', async () => {
    expect(await content.getTag('test_tag')).toStrictEqual({ tag_id: 9 });
    expect(await content.getTag('new_tag')).toStrictEqual({ tag_id: 10 });

    const options: IOptions = {
      userScope: 'self',
      tagScope: 'inclusive'
    };

    expect(await content.searchPostsWithTags('dummy', tags, options, 0)).toHaveLength(10);
    expect(await content.searchPostsWithTags('dummy', tags, options, 5)).toHaveLength(5);
    expect(await content.searchPostsWithTags('dummy', tags, options, 11)).toHaveLength(0);

    expect(await content.searchPostsWithTags('dummy', ['test_tag'], options, 0)).toHaveLength(10);
    expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 0)).toHaveLength(10);
    expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 11)).toHaveLength(0);
  });

  test('searchPostsWithTags search-exclusive-all', async () => {
    expect(await content.getTag('test_tag')).toStrictEqual({ tag_id: 9 });
    expect(await content.getTag('new_tag')).toStrictEqual({ tag_id: 10 });

    const options: IOptions = {
      userScope: 'all',
      tagScope: 'exclusive'
    };

    expect(await content.searchPostsWithTags('dummy', tags, options, 0)).toHaveLength(11);
    expect(await content.searchPostsWithTags('dummy', tags, options, 18)).toHaveLength(2);

    expect(await content.searchPostsWithTags('dummy', ['test_tag'], options, 0)).toHaveLength(0);
    expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 0)).toHaveLength(0);
  });

  test('searchPostsWithTags search-exclusive-self', async () => {
    expect(await content.getTag('test_tag')).toStrictEqual({ tag_id: 9 });
    expect(await content.getTag('new_tag')).toStrictEqual({ tag_id: 10 });

    const options: IOptions = {
      userScope: 'self',
      tagScope: 'exclusive'
    };

    expect(await content.searchPostsWithTags('dummy', tags, options, 0)).toHaveLength(10);
    expect(await content.searchPostsWithTags('dummy', tags, options, 18)).toHaveLength(0);

    expect(await content.searchPostsWithTags('dummy', ['test_tag'], options, 0)).toHaveLength(0);
    expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 0)).toHaveLength(0);
  });

  describe('needs followUser', () => {
    beforeAll(async () => {
      await follows.toggleFollow('dummy', 'dummy2');
    });

    test('searchPostsWithTags search-inclusive-followed', async () => {
      const options: IOptions = {
        userScope: 'followed',
        tagScope: 'inclusive'
      };
    
      expect(await content.searchPostsWithTags('dummy', tags, options, 0)).toHaveLength(10);
      expect(await content.searchPostsWithTags('dummy', tags, options, 5)).toHaveLength(5);
      expect(await content.searchPostsWithTags('dummy', tags, options, 11)).toHaveLength(0);
    
      expect(await content.searchPostsWithTags('dummy', ['test_tag'], options, 0)).toHaveLength(10);
      expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 0)).toHaveLength(10);
      expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 5)).toHaveLength(5);
      expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 11)).toHaveLength(0);
    });
    
    test('searchPostsWithTags search-exclusive-followed', async () => {
      const options: IOptions = {
        userScope: 'followed',
        tagScope: 'exclusive'
      };
    
      expect(await content.searchPostsWithTags('dummy', tags, options, 0)).toHaveLength(10);
      expect(await content.searchPostsWithTags('dummy', tags, options, 5)).toHaveLength(5);
      expect(await content.searchPostsWithTags('dummy', tags, options, 11)).toHaveLength(0);
    
      expect(await content.searchPostsWithTags('dummy', ['test_tag'], options, 0)).toHaveLength(0);
      expect(await content.searchPostsWithTags('dummy', ['new_tag'], options, 0)).toHaveLength(0);
    });
  });
  
  describe('tags dont exist', () => {
    test('searchPostsWithTags search-inclusive-all', async () => {
      const options: IOptions = {
        userScope: 'all',
        tagScope: 'inclusive'
      };
    
      expect(await content.searchPostsWithTags('dummy', ['no_tag'], options, 0)).toHaveLength(0);
    });

    test('searchPostsWithTags search-inclusive-followed', async () => {
      const options: IOptions = {
        userScope: 'followed',
        tagScope: 'inclusive'
      };
    
      expect(await content.searchPostsWithTags('dummy', ['no_tag'], options, 0)).toHaveLength(0);
    });

    test('searchPostsWithTags search-inclusive-self', async () => {
      const options: IOptions = {
        userScope: 'self',
        tagScope: 'inclusive'
      };
    
      expect(await content.searchPostsWithTags('dummy', ['no_tag'], options, 0)).toHaveLength(0);
    });

    test('searchPostsWithTags search-exclusive-all', async () => {
      const options: IOptions = {
        userScope: 'all',
        tagScope: 'exclusive'
      };
    
      expect(await content.searchPostsWithTags('dummy', ['no_tag'], options, 0)).toHaveLength(0);
    });

    test('searchPostsWithTags search-exclusive-followed', async () => {
      const options: IOptions = {
        userScope: 'followed',
        tagScope: 'exclusive'
      };
    
      expect(await content.searchPostsWithTags('dummy', ['no_tag'], options, 0)).toHaveLength(0);
    });

    test('searchPostsWithTags search-exclusive-self', async () => {
      const options: IOptions = {
        userScope: 'self',
        tagScope: 'exclusive'
      };
    
      expect(await content.searchPostsWithTags('dummy', ['no_tag'], options, 0)).toHaveLength(0);
    });
  });
});

describe('get dashboard posts', () => {
  beforeAll(async () => {
    await createAccount('dummy', '123');
    await createAccount('dummy2', '123');

    for (let i = 0; i < 15; i++) {
      const user = (i < 10)
        ? 'dummy'
        : 'dummy2';

      await content.createPost(user, 'post', `test${String(i)}`);
    }
  });

  test('should return nothing', async () => {
    expect(await content.getDashboardPosts('dummy3')).toHaveLength(0);
  });

  test('should work', async () => {
    expect(await content.getDashboardPosts('dummy')).toHaveLength(10);
    expect(await content.getDashboardPosts('dummy2')).toHaveLength(5);
  });

  test('should work with follow', async () => {
    await follows.toggleFollow('dummy2', 'dummy');

    expect(await content.getDashboardPosts('dummy2')).toHaveLength(10);
  });
});
