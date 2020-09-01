import { RequestHandler } from 'express';
import * as account from '../account/accountModel';

export const authCheck: RequestHandler = async (req, res) => {
  const { username } = req.body;

  const user = await account.checkUsername(username);
  if (!user) {
    res.json({error: 'Profile not found'});
    return;
  }

  res.json({ username });
};

