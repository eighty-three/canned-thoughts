import db from './db';
const accountsTable = 'accounts';

export const createAccount = async (username: string, hash: string, argAccountsTable: string = accountsTable) => {
  const input = [username, hash, username];
  await db.none('INSERT INTO $1:name (username, password, name)\
                VALUES ($2:csv)', [argAccountsTable, input]);
};

export const checkUsername = async (username: string, argAccountsTable: string = accountsTable) => {
  return await db.oneOrNone('SELECT username FROM $1:name WHERE username=$2', [argAccountsTable, username]);
};

export const checkPassword = async (username: string, argAccountsTable: string = accountsTable) => {
  return await db.oneOrNone('SELECT password FROM $1:name WHERE username=$2', [argAccountsTable, username]);
};

