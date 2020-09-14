import { RequestHandler } from 'express';
import shortid from 'shortid';
import * as content from './model';

export const createPost: RequestHandler = async (req, res) => {
  const { username, post, tags } = req.body;
  const url = shortid.generate().substr(0, 10);

  const newPost = (tags)
    ? await content.createPost(username, post, url, tags)
    : await content.createPost(username, post, url);
  res.json(newPost);
};

export const searchPosts: RequestHandler = async (req, res) => {
  const { username, tags, options, page } = req.body;
  const offset = (page - 1 <= 0) 
    ? 0
    : (page - 1) * 10;

  const posts = await content.searchPostsWithTags(username, tags, options, offset);
  res.json(posts);
};

export const deletePost: RequestHandler = async (req, res) => {
  const { url } = req.body;
  await content.deletePost(url);
  res.json({ message: 'Post deleted' });
};

export const getPost: RequestHandler = async (req, res) => {
  const username = req.query.username as string;
  const url = req.query.url as string;
  const post = await content.getPost(username, url);
  res.json(post);
};

export const getPosts: RequestHandler = async (req, res) => {
  const username = req.query.username as string;
  const page = req.query.page as string;
  const offset = (Number(page) - 1 <= 0) 
    ? 0
    : (Number(page) - 1) * 10;

  const posts = await content.getPosts(username, offset);
  res.json(posts);
};
