import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

export const createAccount = async (
  username: string, 
  hash: string
): Promise<void> => {
  const query = new PS({ name: 'create-account', text: '\
    INSERT INTO accounts (username, password, name) VALUES ($1, $2, $3)'
  });

  query.values = [username, hash, username];
  await db.none(query);
};

export const checkUsername = async (
  username: string
): Promise<{ username: string } | null> => {
  const query = new PS({ name: 'check-username', text: '\
    SELECT username FROM accounts WHERE username=$1'
  });

  query.values = [username];
  return await db.oneOrNone(query);
};

export const checkPassword = async (
  username: string
): Promise<{ password: string } | null> => {
  const query = new PS({ name: 'check-password', text: '\
    SELECT password FROM accounts WHERE username=$1'
  });

  query.values = [username];
  return await db.oneOrNone(query);
};
