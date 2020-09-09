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
  profileUsername: string,
  loggedInUsername?: string
): Promise<IProfileInfo | null> => {
  const query = new PS({ name: 'get-profile-info', text: '\
    SELECT name, description, followers, date FROM accounts WHERE username=$1'
  });
  query.values = [profileUsername];

  if (loggedInUsername) {
    // If user is logged in, check the follow status
    return await db.task(async t => {
      const checkPS = new PS({ name: 'check-follow-status', text: '\
        SELECT user_id_followed from follows f \
        INNER JOIN accounts a1 ON a1.user_id = user_id_follower \
        INNER JOIN accounts a2 ON a2.user_id = user_id_followed \
        WHERE a1.username=$1 AND a2.username=$2'
      });
      checkPS.values = [loggedInUsername, profileUsername];

      const followed = await t.oneOrNone(checkPS);
      const followStatus = (followed) 
      /* If a user_id is returned, it means 
       * the user follows the visited profile
       */
        ? true
        : false;

      const profileInfo = await t.oneOrNone(query);
      // Return both profile info and follow status
      return {...profileInfo, followStatus};
    });
  } else {
    // Else if user is not logged in, return profile info normally
    return await db.oneOrNone(query);
  }
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
