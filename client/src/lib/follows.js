import ky from 'ky-universal';
import HOST from '@/lib/host';
const api = `${HOST}/api/follows`;

export async function toggleFollowStatus(username, profileUsername) {
  const request = await ky.post(`${api}/toggle`,
    {
      json:
        {
          followerUsername: username,
          followedUsername: profileUsername
        }
    });
  const response = await request.json();
  return response;
}

export async function checkIfFollowed(username, profileUsername) {
  const request = await ky.post(`${api}/check`,
    {
      json:
        {
          followerUsername: username,
          followedUsername: profileUsername
        }
    });
  const response = await request.json();
  return response;
}

export async function getFollowersCount(profileUsername) {
  const request = await ky.post(`${api}/count`,
    {
      json:
        {
          profileUsername
        }
    });

  const response = await request.json();
  return response.followers;
}

