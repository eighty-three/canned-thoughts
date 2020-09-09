import Joi from '@hapi/joi';

export const updateNameAndDescription = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  newName: Joi.string().regex(/^[a-zA-Z0-9 _$!@?#.-]{1,49}$/).required(),
  newDescription: Joi.string().regex(/^[\\/\[\]\(\) a-zA-Z0-9 _'":;~%^&*$!@?#,.-]{1,149}$/).optional()
});

export const getNameAndDescription = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required()
});

export const getProfileInfo = Joi.object({
  profileUsername: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  loggedInUsername: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).optional()
});
