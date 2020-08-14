import Router from 'next/router';
import ky from 'ky-universal';
import HOST from '@/lib/host';
const api = `${HOST}/api/settings`;

export async function changePassword(data, username) {
  const req = await ky.post(`${api}/password`,
    {
      json:
        {
          username,
          'password': data.password,
          'newPassword': data.newPassword
        }
    });
  const response = await req.json();
  const responseMessage = (response.message)
    ? response.message
    : response.error;
  if (response) {
    return responseMessage;
  } else {
    return 'Something went wrong..';
  }
}

export async function changeUsername(data, username) {
  const req = await ky.post(`${api}/username`,
    {
      json:
        {
          username,
          'newUsername': data.newUsername,
          'password': data.password
        }
    });
  const response = await req.json();
  if (response.error) {
    return response.error;
  }
  await logout();
}

export async function deleteAccount(data, username) {
  const req = await ky.post(`${api}/delete`,
    {
      json:
        {
          username,
          'password': data.password
        }
    });
  const response = await req.json();
  if (response.error) {
    return response.error;
  }

  await logout();
}

export async function logout() {
  await ky.post(`${api}/logout`, {json: { 'message': 'Log out' }});
  Router.push('/');
}

