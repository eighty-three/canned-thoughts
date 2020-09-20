import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';
import { IPost, IRelation, IOptions } from './types';

export const createPost = async (
  username: string,
  post: string,
  url: string,
  tags?: string[]
): Promise<IPost> => {
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
    // Getting the tag IDs is necessary to create the posts tags relation properly

    const createPost = new PS({ name: 'create-post-with-tags', text: '\
      WITH ins (user_id, post_id, post, url, tags, date) AS ( \
        INSERT INTO posts (user_id, post, url, tags) \
        VALUES ((SELECT user_id FROM accounts WHERE username=$1), $2, $3, $4) \
        RETURNING user_id, post_id, post, url, tags, date \
      ) \
      SELECT post_id, post, url, tags, TO_CHAR(ins.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM ins \
      INNER JOIN accounts a on a.user_id = ins.user_id'
    });
    createPost.values = [username, post, url, tags];

    return await db.task(async t => {
      const postRow = await t.one(createPost);
      await t.none(
        'INSERT INTO posts_tags (post_id, tag_id) \
        VALUES ($1, $2)', [postRow.post_id, mappedTags]);
      delete postRow.post_id;
      return postRow;
    });

  } else { // If no tags
    const query = new PS({ name: 'create-post-no-tags', text: '\
      WITH ins (user_id, tags, post, url, date) AS ( \
        INSERT INTO posts (user_id, post, url) \
        VALUES ((SELECT user_id FROM accounts WHERE username=$1), $2, $3) \
        RETURNING user_id, tags, post, url, date \
      ) \
      SELECT post, url, tags, TO_CHAR(ins.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM ins \
      INNER JOIN accounts a on a.user_id = ins.user_id'
    });
    
    query.values = [username, post, url];
    return await db.one(query);
  }
};

export const getPost = async (
  username: string,
  url: string
): Promise<IPost | null> => {
  const query = new PS({ name: 'get-post', text: '\
    SELECT post, url, tags, TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM posts p \
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
    SELECT post, url, tags, TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM posts p \
    INNER JOIN accounts a ON a.user_id = p.user_id \
    WHERE a.username=$1 \
    ORDER BY p.date desc LIMIT 11 OFFSET $2'
  });

  query.values = [username, offset];
  return await db.manyOrNone(query);
};

export const getDashboardPosts = async (
  username: string,
): Promise<IPost[] | null> => {
  const query = new PS({ name: 'get-dashboard-posts', text: '\
    WITH post_ids_from_followed AS ( \
      SELECT post_id FROM posts p \
      INNER JOIN follows f ON f.user_id_followed = p.user_id \
      INNER JOIN accounts a ON a.user_id = f.user_id_follower \
      WHERE a.username = $1 \
      ORDER BY p.date DESC LIMIT 10 \
    ), post_ids_from_self AS ( \
      SELECT post_id FROM posts p \
      INNER JOIN accounts a ON a.user_id = p.user_id \
      WHERE a.username = $1 \
      ORDER BY p.date DESC LIMIT 10 \
    ) \
    SELECT post, url, tags, TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date, username, name FROM accounts a \
    INNER JOIN posts p ON p.user_id = a.user_id \
    WHERE p.post_id IN (SELECT post_id from post_ids_from_followed UNION SELECT post_id from post_ids_from_self) \
    ORDER BY p.date DESC LIMIT 10'
  });

  /* First part of the query gets the post_id's from the users the logged in user follows
   * Second part of the query gets the post_id's from the logged in user itself (self posts)
   * Third part of the query gets the posts from the post_id's from the first two parts
   * I can't figure out a way of doing the first and second part in a single query
   * This whole query apparently takes 3ms in total according to EXPLAIN ANALYZE
   */

  query.values = [username];
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
      return t.oneOrNone(tagQuery);
    }));
  });

  const fixedIds = tag_ids.filter((tag) => tag !== null).map((tag) => tag.tag_id);
  /* If there aren't any tags left, meaning all the input tags were not in
   * the `tags` table, return an empty array.
   *
   * e.g. ['tag1', 'tag2', 'tag3'] where none of these are in the `tags` table
   * so after filtering, what remains is []; return an empty array
   *
   *
   * Or if after filtering the tags, the output's length is not the same 
   * as the input's length, meaning there is a tag in the input that is 
   * not in the tags table, where if the tagScope is `exclusive`, it means
   * that there is no post containing that tag, so return an empty array
   *
   * e.g. ['tag1', 'tag2', 'tag3'] where `tag3` does not exist in the `tags` table
   * so after filtering, what remains is ['tag1', 'tag2'], meaning the input length
   * is not the same as the output length, meaning there isn't a post containing those
   * the searched tags exclusively; return an empty array
   */
  if (
    !fixedIds.length 
    || (fixedIds.length !== tags.length && options.tagScope === 'exclusive')
  ) return [];


  /* Inclusive means it returns posts with tags: 
   *    'x', or 'y', or 'x' and 'y'
   * Exclusive means it returns posts with tags: 
   *    'x' only, or 'y' only, or 'x' and 'y' only
   * Followed means it returns posts from people you follow
   * * * * * * * * * * * * * * * * * * * * * * * * * * * */
  if (options.tagScope === 'inclusive') {
  /* ==============================INCLUSIVE ============================== */

    if (options.userScope === 'followed') {
      /* ============ FOLLOWED ============ */
      const query = new PS({ name: 'search-inclusive-followed', text: '\
        SELECT post, url, tags, TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM posts p \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        INNER JOIN follows f ON f.user_id_followed = p.user_id \
        INNER JOIN accounts a ON a.user_id = f.user_id_follower \
        WHERE pt.tag_id && $2 AND a.username = $1\
        ORDER BY p.date desc LIMIT 11 OFFSET $3 \
        ', values: [username, fixedIds, offset]
      });

      return await db.manyOrNone(query);

    } else if (options.userScope === 'all') {
      /* ============ ALL ============ */
      const query = new PS({ name: 'search-inclusive-all', text: '\
        SELECT post, url, tags, TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM posts p \
        INNER JOIN accounts a ON a.user_id = p.user_id \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        WHERE pt.tag_id && $1 \
        ORDER BY p.date desc LIMIT 11 OFFSET $2 \
        ', values: [fixedIds, offset]
      });

      return await db.manyOrNone(query);

    } else {
      /* ============ SELF ============ */
      const query = new PS({ name: 'search-inclusive-self', text: '\
        SELECT post, url, tags, TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM posts p \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        INNER JOIN accounts a ON a.user_id = p.user_id \
        WHERE pt.tag_id && $2 AND a.username = $1\
        ORDER BY p.date desc LIMIT 11 OFFSET $3 \
        ', values: [username, fixedIds, offset]
      });

      return await db.manyOrNone(query);
    }
  
  } else {
  /* ============================== EXCLUSIVE ============================== */

    if (options.userScope === 'followed') {
      /* ============ FOLLOWED ============ */
      const query = new PS({ name: 'search-exclusive-followed', text: '\
        SELECT post, url, tags, TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM posts p \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        INNER JOIN follows f ON f.user_id_followed = p.user_id \
        INNER JOIN accounts a ON a.user_id = f.user_id_follower \
        WHERE pt.tag_id = $2 AND a.username = $1\
        ORDER BY p.date desc LIMIT 11 OFFSET $3 \
        ', values: [username, fixedIds, offset]
      });

      return await db.manyOrNone(query);

    } else if (options.userScope === 'all') {
      /* ============ ALL ============ */
      const query = new PS({ name: 'search-exclusive-all', text: '\
        SELECT post, url, tags, TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM posts p \
        INNER JOIN accounts a ON a.user_id = p.user_id \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        WHERE pt.tag_id = $1 \
        ORDER BY p.date desc LIMIT 11 OFFSET $2 \
        ', values: [fixedIds, offset]
      });

      return await db.manyOrNone(query);

    } else {
      /* ============ SELF ============ */
      const query = new PS({ name: 'search-exclusive-self', text: '\
        SELECT post, url, tags, TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date, a.username, a.name FROM posts p \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
        INNER JOIN accounts a ON a.user_id = p.user_id \
        WHERE pt.tag_id = $2 AND a.username = $1\
        ORDER BY p.date desc LIMIT 11 OFFSET $3 \
        ', values: [username, fixedIds, offset]
      });

      return await db.manyOrNone(query);
    }
  }
};
