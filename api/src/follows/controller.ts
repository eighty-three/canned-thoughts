import { RequestHandler } from 'express';
import { toggleFollow } from './model';

export const toggleFollowStatus: RequestHandler = async (req, res) => {
  const { followerUsername, followedUsername } = req.body;
  await toggleFollow(followerUsername, followedUsername);
  res.status(200).json({ message: 'Success' });
};
