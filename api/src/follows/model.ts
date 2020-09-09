import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

export const toggleFollow = async (
  followerUsername: string, 
  followedUsername: string
): Promise<void> => {
  const checkPS = new PS({ name: 'check-if-followed', text: '\
    SELECT user_id_followed from follows f \
    INNER JOIN accounts a1 ON a1.user_id = user_id_follower \
    INNER JOIN accounts a2 ON a2.user_id = user_id_followed \
    WHERE a1.username=$1 AND a2.username=$2'
  });
  checkPS.values = [followerUsername, followedUsername];

  const updatePS = new PS({ name: 'update-followers-count', text: '\
    UPDATE accounts \
		SET followers= \
      (SELECT count(*) FROM follows \
      INNER JOIN accounts ON user_id = user_id_followed WHERE username=$1) \
		WHERE username=$1'
  });
  updatePS.values = [followedUsername];

  const followPS = new PS({ name: 'follow-user', text: '\
    INSERT INTO follows (user_id_follower, user_id_followed) VALUES \
      ( (SELECT user_id FROM accounts WHERE username=$1), \
        (SELECT user_id FROM accounts WHERE username=$2) )'
  });
  /* Values are user_id's of given usernames (followedUsername and followedUsername)
   * Can this be done without creating two additional SELECT subqueries?
   * * */
  followPS.values = [followerUsername, followedUsername];

  const unfollowPS = new PS({ name: 'unfollow-user', text: '\
    DELETE FROM follows WHERE \
    user_id_follower=(SELECT user_id FROM accounts WHERE username=$1) AND \
    user_id_followed=(SELECT user_id FROM accounts WHERE username=$2)'
  });
  // Same as followUser function where two additional SELECT subqueries are made
  unfollowPS.values = [followerUsername, followedUsername];

  await db.task(async t => {
    const checkIfFollowed = await t.oneOrNone(checkPS);
    (checkIfFollowed)
      ? await t.none(unfollowPS)
      : await t.none(followPS);

    await t.none(updatePS);
  });
};
