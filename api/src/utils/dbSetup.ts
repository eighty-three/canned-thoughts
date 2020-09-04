import db from '@utils/db';

const tables = [
  'posts_tags',
  'tags',
  'posts',
  'follows',
  'accounts'
];

const serials = [
  { table: 'accounts', serialColumn: 'user_id' },
  { table: 'posts', serialColumn: 'post_id' },
  { table: 'tags', serialColumn: 'tag_id' },
];

export const resetData = async (): Promise<void> => {
  tables.forEach(async (table) => {
    await db.none('DELETE FROM $1:name', [table]);
  });
};

export const resetSequence = async (): Promise<void> => {
  // await db.none('ALTER SEQUENCE <tablename>_<id>_seq RESTART;');
  serials.forEach(async (obj) => {
    const input = `${obj.table}_${obj.serialColumn}_seq`;
    await db.none('ALTER SEQUENCE $1:name RESTART', [input]);
  });
};
