import db from './db';
const accountsTable = 'accounts';
const followsTable = 'follows';

const updateFollowersCount = async (
  followedUsername: string,
  argAccountsTable: string = accountsTable, 
  argFollowsTable: string = followsTable
) => {
  await db.none( //Separate query with the count function for the number of followers
    'UPDATE $1:name \
		SET followers= \
      (SELECT count(*) FROM $2:name \
      INNER JOIN $1:name ON user_id = user_id_followed WHERE username=$3) \
		WHERE username=$3 \
    ', [argAccountsTable, argFollowsTable, followedUsername]
  );
};

export const checkIfFollowed = async (
  followerUsername: string, 
  followedUsername: string, 
  argAccountsTable: string = accountsTable, 
  argFollowsTable: string = followsTable
) => {
  console.log(followerUsername);
  console.log(followedUsername);
  return await db.oneOrNone( 
    /*
     * Returns user_id_followed if 
     * followerUsername's user_id = user_id_follower AND
     * followedUsername's user_id = user_id_followed
     * * */
    'SELECT user_id_followed from $2:alias f \
    INNER JOIN $1:alias a1 ON a1.user_id = user_id_follower \
    INNER JOIN $1:alias a2 ON a2.user_id = user_id_followed \
    WHERE a1.username=$3 AND a2.username=$4 \
    ', [argAccountsTable, argFollowsTable, followerUsername, followedUsername]
  );
};

export const followUser = async (
  followerUsername: string, 
  followedUsername: string, 
  argAccountsTable: string = accountsTable, 
  argFollowsTable: string = followsTable
) => {
  await db.none(
    /*
     * Values are user_id's of given usernames (followedUsername and followedUsername)
     * Can this be done without creating two additional SELECT subqueries?
     * * */
    'INSERT INTO $2:name (user_id_follower, user_id_followed) VALUES \
      ((SELECT user_id FROM $1:name WHERE username=$3), \
      (SELECT user_id FROM $1:name WHERE username=$4) ) \
    ', [argAccountsTable, argFollowsTable, followerUsername, followedUsername]
  );

  await updateFollowersCount(followedUsername, argAccountsTable, argFollowsTable);
};

export const unfollowUser = async (
  followerUsername: string, 
  followedUsername: string, 
  argAccountsTable: string = accountsTable, 
  argFollowsTable: string = followsTable
) => {
  await db.none( //Same as createNewFollow function where two additional SELECT subqueries are made
    'DELETE FROM $2:name WHERE \
    user_id_follower=(SELECT user_id FROM $1:name WHERE username=$3) AND \
    user_id_followed=(SELECT user_id FROM $1:name WHERE username=$4) \
    ', [argAccountsTable, argFollowsTable, followerUsername, followedUsername]);

  await updateFollowersCount(followedUsername, argAccountsTable, argFollowsTable);
};

export const getFollowersCount = async (profileUsername: string, argAccountsTable: string = accountsTable) => {
  return await db.one('SELECT followers FROM $1:name WHERE username=$2', [argAccountsTable, profileUsername]);
};
