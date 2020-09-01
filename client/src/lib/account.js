import Router from 'next/router';
import ky from 'ky-universal';
import HOST from '@/lib/host';
const api = `${HOST}/api/account`;

export async function signup(data) {
  const request = await ky.post(`${api}/signup`,
    {
      json:
        {
          'username': data.username,
          'password': data.password
        }
    });
  const response = await request.json();
  if (response.error) {
    return response.error;
  } else {
    Router.replace('/dashboard');
  }
}

export async function login(data, prevPath) {
  const newPath = (
    prevPath.redirect == undefined
    || prevPath.redirect.substr(0, 5) === '/api/'
    || prevPath.redirect[0] !== '/'
  )
    ? '/dashboard'
    : prevPath.redirect;

  const request = await ky.post(`${api}/login`,
    {
      json:
        {
          'username': data.username,
          'password': data.password
        },
      throwHttpErrors: false
    });
  const response = await request.json();
  if (response.error) {
    return response.error;
  } else {
    Router.replace(`${newPath}`);
  }
}

export async function logout() {
  await ky.post(`${api}/logout`, {json: { 'message': 'Log out' }});
  Router.push('/');
}
