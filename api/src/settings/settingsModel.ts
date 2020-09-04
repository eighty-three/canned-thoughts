import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

export const changePassword = async (
  username: string, 
  hash: string
): Promise<void> => {
  const query = new PS({ name: 'change-password', text: '\
    UPDATE accounts SET password=$1 WHERE username=$2'
  });

  query.values = [hash, username];
  await db.none(query);
};

export const changeUsername = async (
  username: string, 
  newUsername: string
): Promise<void> => {
  const query = new PS({ name: 'change-username', text: '\
    UPDATE accounts SET username=$1 WHERE username=$2'
  });

  query.values = [newUsername, username];
  await db.none(query);
};

export const deleteAccount = async (
  username: string
): Promise<void> => {
  const query = new PS({ name: 'delete-account', text: '\
    DELETE FROM accounts WHERE username=$1'
  });

  query.values = [username];
  await db.none(query);
};
