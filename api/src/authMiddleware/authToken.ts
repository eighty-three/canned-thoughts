import { RequestHandler } from 'express';
import config from '../utils/config';
import { verify } from 'jsonwebtoken';
import cookie from 'cookie';

export const verifyToken: RequestHandler = async (req, res, next) => {
  if (!req.headers.cookie) {
    res.json({ error: 'You are not authenticated' });
    return;
  }

  const cookies = cookie.parse(req.headers.cookie);
  verify(cookies.auth, config.SECRET_JWT, async function (err, decoded) {
    if (err && !decoded) {
      res.json({ error: 'You are not authenticated' });
      return;
    }
  });
  next();
  return;
};

export const verifyExistingToken: RequestHandler = async (req, res, next) => {
  if (!req.headers.cookie) {
    next();
    return;
  } else {
    const cookies = cookie.parse(req.headers.cookie);
    verify(cookies.auth, config.SECRET_JWT, async function (err, decoded) {
      if (err && !decoded) {
        next();
        return;
      }
    });
  }
  res.json({ error: 'Bad Request' });
};
