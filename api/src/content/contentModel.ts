import db from '@utils/db';

const accountsTable = 'accounts';
const postsTable = 'posts';
const tagsTable = 'tags';
const postsTagsTable = 'posts_tags';

interface IPost {
  post: string;
  url: string;
  date: number;
  tags: string[];
}

export const createPost = async (
  username: string,
  post: string,
  url: string,
  tags: string[],
  argAccountsTable: string = accountsTable,
  argPostsTable: string = postsTable
): Promise<number> => {
  /* From [ 'tag1', 'tag2', 'tag3' ] as an array
   * to { 'tag1', 'tag2', 'tag3' } as a string
   * because of Postgres' formatting for array types.
   * Maybe I should do away with Postgres' array types
   * since I only need this column as a string;
   * I won't be doing any sort of complex queries on it
   */
  const fixedTags = `{ '${tags.join('\', \'')}' }`;
  const input = [post, url, fixedTags];

  return await db.one(
    'INSERT INTO $3:name (user_id, post, url, tags) \
    VALUES ((SELECT user_id FROM $3:name WHERE username=$2:name), $1:csv) \
    RETURNING post_id', [input, username, argAccountsTable, argPostsTable]
  );
};

export const deletePost = async (
  url: string,
  argPostsTable: string = postsTable
): Promise<void> => {
  await db.none(
    'DELETE FROM $2:name WHERE url=$1:name \
    ', [url, argPostsTable]
  );
};

export const getPost = async (
  url: string,
  argPostsTable: string = postsTable,
): Promise<IPost> => {
  return await db.one(
    'SELECT post, url, date, tags FROM $2:name WHERE url=$1:name \
    ', [url, argPostsTable ]
  );
};

export const getPosts = async (
  username: string,
  offset: number,
  argAccountsTable: string = accountsTable,
  argPostsTable: string = postsTable
): Promise<IPost[] | null> => {
  return await db.manyOrNone(
    // Returns posts in the range `offset` to `offset + 10` by account `username`
    'SELECT post, url, date, tags FROM $4:name p \
    INNER JOIN $3:name a ON a.user_id = p.user_id \
    WHERE a.username=$1:name \
    ORDER BY "TimeStamp" asc LIMIT 10 OFFSET $2:alias \
    ', [username, offset, argAccountsTable, argPostsTable ]
  );
};

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
