import { RequestHandler } from 'express';
import { accounts } from '../models';

export const authCheck: RequestHandler = async (req, res) => {
  const { username } = req.body;

  const user = await accounts.checkUsername(username);
  if (!user) {
    res.json({error: 'Profile not found'});
    return;
  }

  res.json({ username });
};

