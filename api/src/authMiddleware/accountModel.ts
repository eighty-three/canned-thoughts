import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

export const checkUsername = async (
  username: string
): Promise<{ username: string } | null> => {
  const query = new PS({ name: 'check-username', text: '\
    SELECT username FROM accounts WHERE username=$1'
  });

  query.values = [username];
  return await db.oneOrNone(query);
};

export const checkUsernames = async (
  usernames: string[]
): Promise<boolean> => {
  if (usernames.length === 0) {
    return false;
  }

  const usernameChecks = await db.task(t => {
    const queries = usernames.map((username) => {
      const query = new PS({ name: 'check-usernames',
        text: 'SELECT username FROM accounts WHERE username=$1',
        values: [username]
      });
      return t.oneOrNone(query);
    });
    
    return t.batch(queries);
  });

  let bool = true;
  usernameChecks.forEach((check) => {
    if (!check) bool = false;
  });

  return bool;
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
