import ky from 'ky-universal';
import HOST from '@/lib/host';
const api = `${HOST}/api/settings`;

import { logout } from './account';

export const changePassword = async (username, data) => {
  const queryData = {
    username,
    ...data
  };

  try {
    const req = await ky.post(`${api}/password`, { json: queryData, throwHttpErrors: false });
    const response = await req.json();
    return response;
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};

export const changeUsername = async (username, data) => {
  const queryData = {
    username,
    ...data
  };

  try {
    const req = await ky.post(`${api}/username`, { json: queryData, throwHttpErrors: false });
    const response = await req.json();
    if (response.error) return response;

    await logout();
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};

export const deleteAccount = async (username, data) => {
  const queryData = {
    username,
    password: data.password
  };

  try {
    const req = await ky.post(`${api}/delete`, { json: queryData, throwHttpErrors: false });
    const response = await req.json();
    if (response.error) return response;

    await logout();
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};
