import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

const accountsTable = 'accounts';
const postsTable = 'posts';
const tagsTable = 'tags';
const postsTagsTable = 'posts_tags';

interface IPost {
  post: string;
  url: string;
  date: number;
  tags: string;
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
// To do: PreparedStatements

export const createTag = async (
  tag: string,
  argTagsTable: string = tagsTable
): Promise<number> => {
  return await db.one(
    'INSERT INTO $2:name (tag_name) VALUES ($1:name) \
    ', [tag, argTagsTable]
  );
};

export const checkTag = async (
  tag: string,
  argTagsTable: string = tagsTable
): Promise<number | null> => {
  return await db.one(
    'SELECT tag_id FROM $2:name WHERE tag_name=$1:name \
    ', [tag, argTagsTable]
  );
};

export const deleteTag = async (
  tag: string,
  argTagsTable: string = tagsTable
): Promise<void> => {
  await db.none(
    'DELETE FROM $2:name WHERE tag_name=$1:name \
    ', [tag, argTagsTable]
  );
};

export const createPostTagRelation = async (
  post_id:number,
  tag_id: number,
  argPostsTagsTable: string = postsTagsTable
): Promise<void> => {
  const input = [post_id, tag_id];

  await db.none(
    'INSERT INTO $2:name (post_id, tag_id) VALUES ($1:csv) \
    ', [input, argPostsTagsTable]
  );
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
  /* Inclusive means it returns posts with tags 'x', or 'y', or 'x' and 'y'
   * Exclusive means it returns posts with tags 'x' and 'y' only
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
