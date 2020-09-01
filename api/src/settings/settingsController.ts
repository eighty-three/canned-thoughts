import { RequestHandler } from 'express';
import * as argon2 from 'argon2';

import * as settings from './settingsModel';

export const changePassword: RequestHandler = async (req, res) => {
  const { username, newPassword } = req.body;
  const hash = await argon2.hash(newPassword);
  await settings.changePassword(username, hash);
  res.status(200).json({message: 'Password successfully changed!'});
};

export const changeUsername: RequestHandler = async (req, res) => {
  const { username, newUsername } = req.body;
  await settings.changeUsername(username, newUsername);
  res.status(200).json({message: 'Username successfully changed!'});
};

export const deleteAccount: RequestHandler = async (req, res) => {
  const { username } = req.body;
  await settings.deleteAccount(username);
  res.status(200).json({message: 'Account successfully deleted!'});
};
