import db from '@utils/db';
const accountsTable = 'accounts';

interface IUsername {
  username: string;
}

interface IPassword {
  password: string;
}

export const createAccount = async (
  username: string, 
  hash: string, 
  argAccountsTable: string = accountsTable
): Promise<void> => {
  const input = [username, hash, username];
  await db.none(
    'INSERT INTO $1:name (username, password, name) \
    VALUES ($2:csv)', [argAccountsTable, input]);
};

export const checkUsername = async (
  username: string, 
  argAccountsTable: string = accountsTable
): Promise<IUsername | null> => {
  return await db.oneOrNone(
    'SELECT username FROM $1:name WHERE username=$2 \
    ', [argAccountsTable, username]);
};

export const checkPassword = async (
  username: string, 
  argAccountsTable: string = accountsTable
): Promise<IPassword | null> => {
  return await db.oneOrNone(
    'SELECT password FROM $1:name WHERE username=$2 \
    ', [argAccountsTable, username]);
};
