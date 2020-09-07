import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

interface IProfileInfo {
  name: string,
  description: string,
  followers: number,
  date: number
}

type INameAndDescription = Omit<IProfileInfo, 'followers'|'date'>;

export const getProfileInfo = async (
  username: string
): Promise<IProfileInfo | null> => {
  const query = new PS({ name: 'get-profile-info', text: '\
    SELECT name, description, followers, date FROM accounts WHERE username=$1'
  });

  query.values = [username];
  return await db.oneOrNone(query);
};

export const getNameAndDescription = async (
  username: string
): Promise<INameAndDescription | null> => {
  const query = new PS({ name: 'get-name-description', text: '\
    SELECT name, description FROM accounts WHERE username=$1'
  });

  query.values = [username];
  return await db.oneOrNone(query);
};

export const updateNameAndDescription = async (
  username: string, 
  newName: string, 
  newDescription: string
): Promise<void> => {
  const query = new PS({ name: 'update-name-description', text: '\
    UPDATE accounts SET name=$1, description=$2 WHERE username=$3'
  });

  query.values = [newName, newDescription, username];
  await db.none(query);
};
