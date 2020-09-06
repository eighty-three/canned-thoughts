import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken } from '@authMiddleware/index';

import * as content from './contentController';
import * as contentSchema from './content.schema';


router.post('/create',
  validator(contentSchema.createPost, 'body'),
  authToken.verifyToken,
  content.createPost
);

router.post('/search',
  validator(contentSchema.searchPosts, 'body'),
  authToken.verifyToken,
  content.searchPosts
);

router.post('/delete',
  validator(contentSchema.deletePost, 'body'),
  authToken.verifyToken,
  content.deletePost
);

router.get('/getpost',
  validator(contentSchema.getPost, 'query'),
  content.getPost
);

router.get('/getallposts',
  validator(contentSchema.getPosts, 'query'),
  content.getPosts
);

export default router;
