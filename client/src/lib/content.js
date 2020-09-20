import ky from 'ky-universal';
import HOST from '@/lib/host';
const api = `${HOST}/api/content`;

export const checkIfValidTags = (tags) => {
  const arr = tags.trim().split(' '); // for length
  const set = [...new Set(arr.map((tag) => tag.toLowerCase()))]; // for uniqueness

  return (arr.length <= 3 && arr.length === set.length)
    ? true
    : false;
};

export const searchPosts = async (username, data, page, ctx) => {
  const headers = (ctx) ? ctx.req.headers : null;
  const customPost = ky.create({ headers });

  const tags = (data.tags) ? data.tags.trim().split(' ') : null;

  const options = {
    userScope: data.userScope,
    tagScope: data.tagScope
  };

  const fixedPage = (page || page > 0) ? page : 0;

  const queryData = {
    username,
    tags,
    options,
    page: fixedPage
  };
  
  try {
    const req = (ctx)
      ? await customPost.post(`${api}/search`, { json: queryData })
      : await ky.post(`${api}/search`, { json: queryData });

    const response = await req.json();
    return response;
  } catch (err) {
    return [];
  }
};

export const createPost = async (username, data) => {
  const queryData = (data.tags) 
    ? { username, post: data.post, tags: data.tags.trim().split(' ') } 
    : { username, post: data.post };
    
  try {
    const req = await ky.post(`${api}/create`, { json: queryData });
    const response = await req.json();
    return response;
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};

export const getPost = async (username, url) => {
  try {
    const req = await ky.get(`${api}/getpost?username=${username}&url=${url}`);
    const response = await req.json();
    return (response) ? response : { error: 'Post not found' };
  } catch (err) {
    return { error: 'Post not found' };
  }
};

export const getPosts = async (username, page) => {
  const fixedPage = (page || page > 0) ? page : 0;

  try {
    const req = await ky.get(`${api}/getallposts?username=${username}&page=${fixedPage}`);
    const response = await req.json();
    return response;
  } catch (err) {
    return [];
  }
};

export const getDashboardPosts = async (username, ctx) => {
  const headers = ctx.req.headers;
  const customPost = ky.create({ headers });

  try {
    const req = await customPost.post(`${api}/dashboard`, { json: { username } });
    const response = await req.json();
    return response;
  } catch (err) {
    return [];
  }
};
