import { RequestHandler } from 'express';
import * as profile from './model';

export const updateNameAndDescription: RequestHandler = async (req, res) => {
  const { username, newName, newDescription } = req.body;
  await profile.updateNameAndDescription(username, newName, newDescription);
  res.status(200).json({message: 'Profile successfully updated!'});
};

export const getNameAndDescription: RequestHandler = async (req, res) => {
  const username = req.query.username as string;
  const nameAndDescription = await profile.getNameAndDescription(username);
  res.status(200).json(nameAndDescription);
};

export const getProfileInfo: RequestHandler = async (req, res) => {
  const profileUsername = req.query.profileUsername as string;
  const loggedInUsername = req.query.loggedInUsername as string;
  const profileInfo = await profile.getProfileInfo(profileUsername, loggedInUsername);
  res.status(200).json(profileInfo);
};
