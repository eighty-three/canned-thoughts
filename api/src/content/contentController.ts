import { RequestHandler } from 'express';
import shortid from 'shortid';
import * as content from './contentModel';

const getTags = (post: string): { fixedPost: string, tags: string[] } => {
  const arr = post.split('#');
  const num = (arr.length - 3 > 0)
    ? arr.length - 3
    : 1;
  const tags = [];
  const toFilter = arr.splice(num);

  for (let i = 0; i < toFilter.length; i++) {
    const str = toFilter[i].trim(); // Remove whitespace
    if (str) tags.push(str);
  }

  const fixedPost = arr.join('#').trim();

  return { fixedPost, tags };
};

export const createPost: RequestHandler = async (req, res) => {
  const { username, post } = req.body;
  const url = shortid.generate().substr(0, 10);
  const { fixedPost, tags } = getTags(post);

  (tags.length)
    ? await content.createPost(username, fixedPost, url, tags)
    : await content.createPost(username, fixedPost, url);
  res.json({ message: 'Post created' });
};

export const searchPosts: RequestHandler = async (req, res) => {
  const { username, tags, options, page } = req.body;
  const offset = page * 10; // 10 posts each page

  const posts = await content.searchPostsWithTags(username, tags, options, offset);
  res.json(posts);
};

export const deletePost: RequestHandler = async (req, res) => {
  const { url } = req.body;
  await content.deletePost(url);
  res.json({ message: 'Post deleted' });
};

export const getPost: RequestHandler = async (req, res) => {
  const { username, url } = req.body;
  const post = await content.getPost(username, url);
  res.json(post);
};

export const getPosts: RequestHandler = async (req, res) => {
  const { username, page } = req.body;
  const offset = page * 10; // 10 posts each page

  const posts = await content.getPosts(username, offset);
  res.json(posts);
};
