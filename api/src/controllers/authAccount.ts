import { RequestHandler } from 'express';
import { accounts } from '../models';
import * as argon2 from 'argon2';

export const checkExistingUsername: RequestHandler = async (req, res, next) => {
  const { username } = req.body;

  const user = await accounts.checkUsername(username);
  if (!user) {
    next();
    return;
  } else {
    res.json({error: 'Username already taken'});
  }
};

export const checkPassword: RequestHandler = async (req, res, next) => {
  const { username, password } = req.body;

  const user = await accounts.checkPassword(username);
  if (!user) {
    res.json({error: 'Username not found'});
    return;
  }

  const hash = user.password;
  if (await argon2.verify(hash, password)) {
    next();
    return;
  } else {
    res.json({error: 'Invalid password'});
  }
};

export const replaceExistingUsername: RequestHandler = async (req, res, next) => {
  const { newUsername } = req.body;

  const user = await accounts.checkUsername(newUsername);
  if (!user) {
    next();
    return;
  } else {
    res.json({error: 'Username already taken'});
  }
};


export const checkIfUsernameExists: RequestHandler = async (req, res, next) => {
  const { username } = req.body;

  const user = await accounts.checkUsername(username);
  if (!user) {
    res.json({error: 'Username not found'});
    return;
  }

  next();
  return;
};
