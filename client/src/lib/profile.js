import ky from 'ky-universal';
import HOST from '@/lib/host';
const api = `${HOST}/api/profile`;

export const getNameAndDescription = async (username) => {
  try {
    const req = await ky.get(`${api}/getinfo?username=${username}`);
    const response = await req.json();
    return response;
  } catch (err) {
    return { name: null, description: null };
  }
};

export const getProfileInfo = async (profileUsername, loggedInUsername) => {
  const query = (profileUsername !== loggedInUsername)
    ? `profileUsername=${profileUsername}&loggedInUsername=${loggedInUsername}`
    : `profileUsername=${profileUsername}`;

  try {
    const req = await ky.get(`${api}/getall?${query}`);
    const response = await req.json();

    if (!response) {
      return { error: 'Profile not found' };
    } else {
      return response;
    }
  } catch (err) {
    return { error: 'Profile not found' };
  }
};

export const updateProfileInfo = async (username, data) => {
  const queryData = (data.newDescription)
    ? { username, ...data }
    : { username, newName: data.newName };

  try {
    const req = await ky.post(`${api}/update`, { json: queryData, throwHttpErrors: false });
    const response = await req.json();
    return response;
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};
