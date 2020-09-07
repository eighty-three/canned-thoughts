import { RequestHandler } from 'express';
import * as authAccount from './accountModel';

export const authCheck: RequestHandler = async (req, res) => {
  const { username } = req.body;

  const user = await authAccount.checkUsername(username);
  if (!user) {
    res.json({error: 'Profile not found'});
    return;
  }

  res.json({ username });
};

