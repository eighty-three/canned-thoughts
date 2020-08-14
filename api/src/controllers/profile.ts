import { RequestHandler } from 'express';
import { profile } from '../models';
import { accounts } from '../models';

export const updateNameAndDescription: RequestHandler = async (req, res) => {
  const { username, newName, newDescription } = req.body;
  await profile.updateNameAndDescription(username, newName, newDescription);
  res.status(200).json({message: 'Profile successfully updated!'});
};

export const getNameAndDescription: RequestHandler = async (req, res) => {
  const { username } = req.body;
  const nameAndDescription = await profile.getNameAndDescription(username);
  res.status(200).json(nameAndDescription);
};

export const getAllProfileInfo: RequestHandler = async (req, res) => {
  const { username } = req.body;

  const user = await accounts.checkUsername(username);
  if (!user) {
    res.json({error: 'Profile not found'});
    return;
  }

  const profileInfo = await profile.getAllProfileInfo(username);
  res.status(200).json(profileInfo);
};

