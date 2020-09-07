import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';
import { IPost, IRelation, IOptions } from './types';

export const createPost = async (
  username: string,
  post: string,
  url: string,
  tags?: string[]
): Promise<void> => {
  if (tags) {
    /* If the tag is not in the database,
     * create tag, returning tag_id. Else,
     * return its tag_id.
     */
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

    const mappedTags = tag_ids.map((tag) => Number(tag.tag_id));

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

    await db.task(async t => {
      const postRow = await t.one(createPost);
      await t.none(
        'INSERT INTO posts_tags (post_id, tag_id) \
        VALUES ($1, $2)', [postRow.post_id, mappedTags]);
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
  username: string,
  url: string
): Promise<IPost | null> => {
  const query = new PS({ name: 'get-post', text: '\
    SELECT post, url, p.date, tags FROM posts p \
    INNER JOIN accounts a on a.user_id = p.user_id \
    WHERE a.username=$1 AND p.url=$2'
  });

  query.values = [username, url];
  return await db.oneOrNone(query);
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
): Promise<number | void> => {
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

export const searchPostsWithTags = async (
  username: string,
  tags: string[],
  options: IOptions,
  offset: number
): Promise<IPost[] | null> => {
  const tagQuery = new PS({ name: 'find-tag-id', text: '\
    SELECT tag_id FROM tags WHERE tag_name=$1'
  });

  const tag_ids = await db.tx(t => {
    return t.batch(tags.map((tag) => {
      tagQuery.values = [tag];
      return t.one(tagQuery);
    }));
  });

  const fixedIds = tag_ids.map((tag) => tag.tag_id);

  /* Inclusive means it returns posts with tags: 
   *    'x', or 'y', or 'x' and 'y'
   * Exclusive means it returns posts with tags: 
   *    'x' only, or 'y' only, or 'x' and 'y' only
   * Followed means it returns posts from people you follow
   * * * * * * * * * * * * * * * * * * * * * * * * * * * */
  if (options.scope === 'inclusive') {
  /* ==============================INCLUSIVE ============================== */

    if (options.followedOnly) {
      /* ============ FOLLOWED ============ */
      const query = new PS({ name: 'search-inclusive-followed', text: '\
        SELECT post, url, p.date, tags FROM posts p \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        INNER JOIN follows f ON f.user_id_followed = p.user_id \
        INNER JOIN accounts a ON a.user_id = f.user_id_followed \
        WHERE pt.tag_id && $2 AND a.username = $1\
        ORDER BY p.date asc LIMIT 10 OFFSET $3 \
        ', values: [username, fixedIds, offset]
      });

      return await db.manyOrNone(query);

    } else {
      /* ============ ALL ============ */
      const query = new PS({ name: 'search-inclusive-all', text: '\
        SELECT post, url, p.date, tags FROM posts p \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        WHERE pt.tag_id && $1 \
        ORDER BY p.date asc LIMIT 10 OFFSET $2 \
        ', values: [fixedIds, offset]
      });

      return await db.manyOrNone(query);
    }

  
  } else {
  /* ============================== EXCLUSIVE ============================== */

    if (options.followedOnly) {
      /* ============ FOLLOWED ============ */
      const query = new PS({ name: 'search-exclusive-followed', text: '\
        SELECT post, url, p.date, tags FROM posts p \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        INNER JOIN follows f ON f.user_id_followed = p.user_id \
        INNER JOIN accounts a ON a.user_id = f.user_id_followed \
        WHERE pt.tag_id = $2 AND a.username = $1\
        ORDER BY p.date asc LIMIT 10 OFFSET $3 \
        ', values: [username, fixedIds, offset]
      });

      return await db.manyOrNone(query);

    } else {
      /* ============ ALL ============ */
      const query = new PS({ name: 'search-exclusive-all', text: '\
        SELECT post, url, p.date, tags FROM posts p \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        WHERE pt.tag_id = $1 \
        ORDER BY p.date asc LIMIT 10 OFFSET $2 \
        ', values: [fixedIds, offset]
      });

      return await db.manyOrNone(query);
    }
  }
};
