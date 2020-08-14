import ky from 'ky-universal';
import HOST from '@/lib/host';
const api = `${HOST}/api/profile`;

export async function updateProfileInfo(data, username) {
  const request = await ky.post(`${api}/update`,
    {
      json:
        {
          username,
          'newName': data.newName,
          'newDescription': data.newDescription
        }
    });

  const response = await request.json();
  const responseMessage = (response.message)
    ? response.message
    : response.error;
  return responseMessage;
}

export async function getNameAndDescription(username) {

  const request = await ky.post(`${api}/getinfo`,
    {
      json:
        {
          username
        }
    });

  const response = await request.json();
  return response;
}

export async function getProfileInfo(username) {
  const request = await ky.post(`${api}/getall`,
    {
      json:
        {
          username
        }
    });

  const response = await request.json();
  return response;
}
