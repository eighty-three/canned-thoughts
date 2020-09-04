import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

const updateFollowersCount = async (
  followedUsername: string
): Promise<void> => {
  const query = new PS({ name: 'update-followers-count', text: '\
    UPDATE accounts \
		SET followers= \
      (SELECT count(*) FROM follows \
      INNER JOIN accounts ON user_id = user_id_followed WHERE username=$1) \
		WHERE username=$1'
  });

  // Separate query with the count function for the number of followers
  query.values = [followedUsername];
  await db.none(query);
};


export const checkIfFollowed = async (
  followerUsername: string, 
  followedUsername: string
): Promise<{ user_id_followed: number } | null> => {
  /* Returns user_id_followed if 
   * followerUsername's user_id = user_id_follower AND
   * followedUsername's user_id = user_id_followed
   * * */
  const query = new PS({ name: 'check-if-followed', text: '\
    SELECT user_id_followed from follows f \
    INNER JOIN accounts a1 ON a1.user_id = user_id_follower \
    INNER JOIN accounts a2 ON a2.user_id = user_id_followed \
    WHERE a1.username=$1 AND a2.username=$2'
  });

  query.values = [followerUsername, followedUsername];
  return await db.oneOrNone(query);
};

export const followUser = async (
  followerUsername: string, 
  followedUsername: string
): Promise<void> => {
  const query = new PS({ name: 'follow-user', text: '\
    INSERT INTO follows (user_id_follower, user_id_followed) VALUES \
      ( (SELECT user_id FROM accounts WHERE username=$1), \
        (SELECT user_id FROM accounts WHERE username=$2) )'
  });

  /* Values are user_id's of given usernames (followedUsername and followedUsername)
   * Can this be done without creating two additional SELECT subqueries?
   * * */
  query.values = [followerUsername, followedUsername];
  await db.none(query);

  await updateFollowersCount(followedUsername);
};

export const unfollowUser = async (
  followerUsername: string, 
  followedUsername: string
): Promise<void> => {
  // Same as followUser function where two additional SELECT subqueries are made
  const query = new PS({ name: 'unfollow-user', text: '\
    DELETE FROM follows WHERE \
    user_id_follower=(SELECT user_id FROM accounts WHERE username=$1) AND \
    user_id_followed=(SELECT user_id FROM accounts WHERE username=$2)'
  });

  query.values = [followerUsername, followedUsername];
  await db.none(query);

  await updateFollowersCount(followedUsername);
};
