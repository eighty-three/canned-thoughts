import { RequestHandler } from 'express';
import * as profile from './profileModel';

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

export const getProfileInfo: RequestHandler = async (req, res) => {
  const { username } = req.body;
  const nameAndDescription = await profile.getProfileInfo(username);
  res.status(200).json(nameAndDescription);
};
