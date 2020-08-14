import { RequestHandler } from 'express';
import { accounts } from '../models';
import config from '../utils/config';
import * as argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import cookie from 'cookie';

export const login: RequestHandler = async (req, res) => {
  const { username } = req.body;

  const claims = { username };
  const authToken = sign(claims, config.SECRET_JWT, { expiresIn: '3h' });
  res.setHeader('Set-Cookie', cookie.serialize('auth', authToken, {
    httpOnly: true,
    secure: config.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 10800,
    path: '/'
  }));

  res.status(200).json({ message: 'Cookie set' });
};

export const signup: RequestHandler = async (req, res) => {
  const { username, password } = req.body;
  const hash = await argon2.hash(password);
  await accounts.createAccount(username, hash);

  const claims = { username };
  const authToken = sign(claims, config.SECRET_JWT, { expiresIn: '3h' });
  res.setHeader('Set-Cookie', cookie.serialize('auth', authToken, {
    httpOnly: true,
    secure: config.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 10800,
    path: '/'
  }));

  res.status(200).json({ message: 'Cookie set' });
};
