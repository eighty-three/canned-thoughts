import Joi from '@hapi/joi';

export const createPost = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  post: Joi.string().regex(/^[\\/\[\]\(\) \n a-zA-Z0-9 _'":;~%^&*$!@?#,.-]{1,249}$/).required(),
  tags: Joi.array().items(
    Joi.string().regex(/^[a-zA-Z0-9]{1,99}$/).required()
  ).optional(),
});

export const searchPosts = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  tags: Joi.array().max(3).items(
    Joi.string().regex(/^[a-zA-Z0-9]{1,99}$/).required()
  ).required(),
  options: Joi.object({
    userScope: Joi.string().valid('all', 'followed', 'self').required(),
    tagScope: Joi.string().valid('inclusive', 'exclusive').required()
  }).required(),
  page: Joi.number().integer().min(0).max(99999).required()
});

export const deletePost = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9_-]{7,10}$/).required()
});

export const getPost = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9_-]{7,10}$/).required()
});

export const getPosts = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  page: Joi.number().integer().min(0).max(99999).required()
});

export const getDashboardPosts = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
});
