import ky from 'ky-universal';
import cookie from 'cookie';
import { verify } from 'jsonwebtoken';
import HOST from '@/lib/host';
const api = `${HOST}/api`;

const secret = process.env.SECRET;

const authCheck = async (ctx) => {
  const reqCookie = ctx.req.headers.cookie;
  if (!reqCookie) return null; //No token

  const cookies = cookie.parse(reqCookie);
  const payload = verify(cookies.auth, secret);
  if (!payload) return null; //Invalid token

  const { username } = payload;
  const headers = ctx.req.headers;
  const customPost = ky.create({ headers });
  
  const request = await customPost.post(`${api}/verify`,
    {
      json:
        {
          username: username
        }
    });
  const response = await request.json();
  if (response.error) {
    await ky.post(`${api}/account/logout`, {json: { 'message': 'Log out' }});
    window.location.href=HOST;
  }

  return username;
};

export const lightAuthCheck = async (ctx) => {
  const reqCookie = ctx.req.headers.cookie;
  if (!reqCookie) return null; //No token

  const cookies = cookie.parse(reqCookie);
  const payload = verify(cookies.auth, secret);
  if (!payload) return null; //Invalid token

  const { username } = payload;
  return username;
};

export default authCheck;
