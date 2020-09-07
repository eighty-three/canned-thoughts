import { RequestHandler } from 'express';
import * as follows from './model';

export const checkIfFollowed: RequestHandler = async (req, res) => {
  const followerUsername = req.query.followerUsername as string;
  const followedUsername = req.query.followedUsername as string;

  const followed = await follows.checkIfFollowed(followerUsername, followedUsername);
  (followed)
    ? res.status(200).json(true)
    : res.status(200).json(false);
};

export const toggleFollowStatus: RequestHandler = async (req, res) => {
  const { followerUsername, followedUsername } = req.body;

  const followed = await follows.checkIfFollowed(followerUsername, followedUsername);
  if (followed) {
    await follows.unfollowUser(followerUsername, followedUsername);
    res.status(200).json({ message: 'Unfollowed' });
    return;
  } else {
    await follows.followUser(followerUsername, followedUsername);
    res.status(200).json({ message: 'Followed' });
  }
};

