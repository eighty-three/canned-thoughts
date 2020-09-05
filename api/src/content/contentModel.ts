import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';
import { IPost, IRelation, IOptions } from './content.types';

const accountsTable = 'accounts';
const postsTable = 'posts';
const postsTagsTable = 'posts_tags';

export const createPost = async (
  username: string,
  post: string,
  url: string,
  tags?: string[]
): Promise<void> => {
  if (tags) {
    /* From [ 'tag1', 'tag2', 'tag3' ] as an array
     * to 'tag1|tag2|tag3' as a string
     * since the | character won't be allowed in the form
     * so when getting the post data, I can easily transform it
     * with a split call using the | character
     */
    const fixedTags = `${tags.join('|')}`;
    const createPost = new PS({ name: 'create-post-with-tags', text: '\
      INSERT INTO posts (user_id, post, url, tags) \
      VALUES ((SELECT user_id FROM accounts WHERE username=$1), $2, $3, $4) \
      RETURNING post_id',
    });
    
    createPost.values = [username, post, url, fixedTags];
    const createPostOutput = await db.one(createPost);
    
    const tag_ids = await db.tx(t => {
      const tagQueries = tags.map((tag) => {
        const tagQuery = new PS({ name: 'create-tag', text: '\
          WITH ins AS (\
            INSERT INTO tags (tag_name)\
            VALUES ($1)\
            ON     CONFLICT (tag_name) DO UPDATE\
            SET    tag_name = NULL \
            WHERE  FALSE\
            RETURNING tag_id\
            )\
          SELECT tag_id FROM ins\
            UNION  ALL\
            SELECT tag_id FROM tags\
            WHERE  tag_name = $1'
        });
    
        tagQuery.values = [tag];
        return t.one(tagQuery);
      });
    
      return t.batch(tagQueries);
    });
    
    await db.tx(t => {
      const queries = tag_ids.map((tag) => {
        t.none(
          'INSERT INTO posts_tags (post_id, tag_id) \
          VALUES ($1, $2)', [createPostOutput.post_id, tag.tag_id]);
      });
    
      return t.batch(queries);
    });
  } else { // If no tags
    const query = new PS({ name: 'create-post-no-tags', text: '\
      INSERT INTO posts (user_id, post, url) \
      VALUES ((SELECT user_id FROM accounts WHERE username=$1), $2, $3)'
    });
    
    query.values = [username, post, url];
    await db.none(query);
  }
};

export const getPost = async (
  url: string
): Promise<IPost> => {
  const query = new PS({ name: 'get-post', text: '\
    SELECT post, url, date, tags FROM posts WHERE url=$1'
  });

  query.values = [url];
  return await db.one(query);
};

export const getPosts = async (
  username: string,
  offset: number
): Promise<IPost[] | null> => {
  // Returns posts in the range `offset` to `offset + 10` by account `username`
  const query = new PS({ name: 'get-posts', text: '\
    SELECT post, url, p.date, tags FROM posts p \
    INNER JOIN accounts a ON a.user_id = p.user_id \
    WHERE a.username=$1 \
    ORDER BY p.date asc LIMIT 10 OFFSET $2'
  });

  query.values = [username, offset];
  return await db.manyOrNone(query);
};

export const deletePost = async (
  url: string
): Promise<void> => {
  const query = new PS({ name: 'delete-post', text: '\
    DELETE FROM posts WHERE url=$1'
  });

  query.values = [url];
  await db.none(query);
};


// Tags
export const getTag = async (
  tag: string
): Promise<number|void> => {
  // https://stackoverflow.com/a/40325406/435563
  // tl;dr: inefficiencies and race conditions
  const query = new PS({ name: 'get-tag', text: '\
    WITH ins AS (\
      INSERT INTO tags (tag_name)\
      VALUES ($1)\
      ON     CONFLICT (tag_name) DO UPDATE\
      SET    tag_name = NULL \
      WHERE  FALSE\
      RETURNING tag_id\
      )\
    SELECT tag_id FROM ins\
    UNION  ALL\
    SELECT tag_id FROM tags\
    WHERE  tag_name = $1'
  });

  query.values = [tag];
  return await db.one(query);
};

export const deleteTag = async (
  tag: string
): Promise<void> => {
  const query = new PS({ name: 'delete-tag', text: '\
    DELETE FROM tags WHERE tag_name=$1'
  });

  query.values = [tag];
  await db.none(query);
};


export const checkPostsTagsTable = async (): Promise<IRelation[] | null> => {
  return await db.manyOrNone('SELECT * FROM posts_tags');
};

// To do
export const searchPostsWithTag = async (
  username: string,
  tags: string[],
  options: IOptions,
  argAccountsTable: string = accountsTable,
  argPostsTable: string = postsTable,
  argPostsTagsTable: string = postsTagsTable
): Promise<IPost[] | null> => {
  /* Inclusive means it returns posts with tags: 
   *    'x', or 'y', or 'x' and 'y'
   * Exclusive means it returns posts with tags: 
   *    'x' only, or 'y' only, or 'x' and 'y' only
   */
  if (options.scope === 'inclusive') {
    if (options.followedOnly) {
      return await db.manyOrNone(
        'SELECT * from $1:name', [argAccountsTable]
      );
    } else {
      return await db.manyOrNone(
        'SELECT * from $1:name', [argAccountsTable]
      );
    }
  } else { // options.scope === 'exclusive'
    if (options.followedOnly) {
      return await db.manyOrNone(
        'SELECT * from $1:name', [argAccountsTable]
      );
    } else {
      return await db.manyOrNone(
        'SELECT * from $1:name', [argAccountsTable]
      );
    }
  }
};
