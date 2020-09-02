import Joi from '@hapi/joi';

export const checkIfFollowed = Joi.object({
  followedUsername: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  followerUsername: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required()
});

export const toggleFollowStatus = Joi.object({
  followedUsername: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  followerUsername: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required()
});
