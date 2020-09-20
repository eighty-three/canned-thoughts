import ky from 'ky-universal';
import HOST from '@/lib/host';
const api = `${HOST}/api/follows`;

export const toggleFollowStatus = async (username, profileUsername) => {
  const queryData = {
    followerUsername: username,
    followedUsername: profileUsername
  };

  try {
    const req = await ky.post(`${api}/toggle`, { json: queryData });
    const response = await req.json();
    return response;
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};
