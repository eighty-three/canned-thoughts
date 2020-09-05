import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

const accountsTable = 'accounts';
const postsTable = 'posts';
const postsTagsTable = 'posts_tags';

interface IPost {
  post: string;
  url: string;
  date: number;
  tags: string;
}

interface IError {
  error: string;
}

export const createPost = async (
  username: string,
  post: string,
  url: string,
  tags?: string[]
): Promise<number> => {
  /* From [ 'tag1', 'tag2', 'tag3' ] as an array
   * to 'tag1|tag2|tag3' as a string
   * since the | character won't be allowed in the form
   * so when getting the post data, I can easily transform it
   * with a split call using the | character
   */
  const fixedTags = (tags)
    ? `${tags.join('|')}`
    : null;

  const query = new PS({ name: 'create-post', text: '\
    INSERT INTO posts (user_id, post, url, tags) \
    VALUES ((SELECT user_id FROM accounts WHERE username=$1), $2, $3, $4) \
    RETURNING post_id',
  });

  query.values = [username, post, url, fixedTags];
  return await db.one(query);
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
export const createTag = async (
  tag: string
): Promise<number|IError> => {
  const query = new PS({ name: 'create-tag', text: '\
    INSERT INTO tags (tag_name) VALUES ($1) RETURNING tag_id'
  });

  query.values = [tag];
  //return await db.one(query);
  try {
    return await db.one(query);
  } catch {
    return {error: 'Tag exists'};
  }
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

export const createPostTagRelation = async (
  post_id:number,
  tag_id: number
): Promise<void> => {
  const query = new PS({ name: 'create-post-tag-relation', text: '\
    INSERT INTO posts_tags (post_id, tag_id) VALUES ($1, $2)'
  });

  query.values = [post_id, tag_id];
  await db.none(query);
};

interface IOptions {
  scope: 'inclusive' | 'exclusive';
  followedOnly: boolean;
}

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
