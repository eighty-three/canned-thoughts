import db from '@utils/db';
const accountsTable = 'accounts';

interface IProfileInfo {
  name: string,
  description: string,
  followers: number
}

type INameAndDescription = Omit<IProfileInfo, 'followers'>;

export const getProfileInfo = async (
  username: string, 
  argAccountsTable: string = accountsTable
): Promise<IProfileInfo> => {
  return await db.one(
    'SELECT name, description, followers FROM $1:name WHERE username=$2 \
    ', [argAccountsTable, username]);
};

export const getNameAndDescription = async (
  username: string, 
  argAccountsTable: string = accountsTable
): Promise<INameAndDescription> => {
  return await db.one(
    'SELECT name, description FROM $1:name WHERE username=$2 \
    ', [argAccountsTable, username]);
};

export const updateNameAndDescription = async (
  username: string, 
  newName: string, 
  newDescription: string, 
  argAccountsTable: string = accountsTable
): Promise<void> => {
  await db.none(
    'UPDATE $1:name \
    SET name=$2, description=$3 \
    WHERE username=$4 \
    ', [argAccountsTable, newName, newDescription, username]);
};
