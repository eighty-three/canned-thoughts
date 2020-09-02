import db from '@utils/db';
const accountsTable = 'accounts';

export const changePassword = async (
  username: string, 
  hash: string, 
  argAccountsTable: string = accountsTable
): Promise<void> => {
  await db.none(
    'UPDATE $1:name SET password=$2 WHERE username=$3 \
    ', [argAccountsTable, hash, username]);
};

export const changeUsername = async (
  username: string, 
  newUsername: string, 
  argAccountsTable: string = accountsTable
): Promise<void> => {
  await db.none(
    'UPDATE $1:name SET username=$3 WHERE username=$2 \
    ', [argAccountsTable, username, newUsername]);
};

export const deleteAccount = async (
  username: string, 
  argAccountsTable: string = accountsTable
): Promise<void> => {
  await db.none(
    'DELETE FROM $1:name WHERE username=$2 \
    ', [argAccountsTable, username]);
};
