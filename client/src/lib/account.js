import Router from 'next/router';
import ky from 'ky-universal';
import HOST from '@/lib/host';
const api = `${HOST}/api/account`;

export const signup = async (data) => {
  try {
    const req = await ky.post(`${api}/signup`, { json: {...data}, throwHttpErrors: false });
    const response = await req.json();
    
    if (response.error) {
      return response.error;
    } else {
      Router.replace('/dashboard');
    }
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};

export const login = async (prevPath, data) => {
  const newPath = (
    prevPath.redirect == undefined
    || prevPath.redirect.substr(0, 5) === '/api/'
    || prevPath.redirect[0] !== '/'
  )
    ? '/dashboard'
    : prevPath.redirect;


  try {
    const req = await ky.post(`${api}/login`, { json: {...data}, throwHttpErrors: false });
    const response = await req.json();
    
    if (response.error) {
      return response.error;
    } else {
      Router.replace(`${newPath}`);
    }
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};

export const logout = async () => {
  await ky.post(`${api}/logout`, { json: { 'message': 'Log out' } });
  Router.push('/');
};
