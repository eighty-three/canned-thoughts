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
