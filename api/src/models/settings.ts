import db from './db';
const accountsTable = 'accounts';
//const postsTable = 'posts';
//const postsTagsTable = 'posts_tag';
//const followTable = 'follow';

export const changePassword = async (username: string, hash: string, argAccountsTable: string = accountsTable) => {
  await db.none('UPDATE $1:name SET password=$2 WHERE username=$3', [argAccountsTable, hash, username]);
};

export const changeUsername = async (username: string, newUsername: string, argAccountsTable: string = accountsTable) => {
  await db.none('UPDATE $1:name SET username=$3 WHERE username=$2', [argAccountsTable, username, newUsername]);
};

export const deleteAccount = async (username: string, argAccountsTable: string = accountsTable) => {
  await db.none('DELETE FROM $1:name WHERE username=$2', [argAccountsTable, username]);
  //await db.none('DELETE FROM $1:name WHERE fkey_username=$2', [argAccountsTable, username]);
  //await db.none('DELETE FROM $1:name WHERE follower=$2 OR followed=$2', [argAccountsTable, username]);
};
