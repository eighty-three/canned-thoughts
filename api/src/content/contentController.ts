import { RequestHandler } from 'express';
import config from '../utils/config';
import { verify } from 'jsonwebtoken';
import cookie from 'cookie';

interface IPayload {
  username?: string,
  iat?: number,
  exp?: number
}

export const createThought: RequestHandler = async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie!);
  const payload: IPayload | string = verify(cookies.auth, config.SECRET_JWT);
  const { username } = payload as IPayload;
  res.json({ username });
};


//import * as content from './content';
//const contentRoutes = ['/content/thought'];
//router.post(contentRoutes, authToken.verifyToken);
//router.post('/content/thought', content.createThought);
