import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken } from '@authMiddleware/index';

import * as content from './controller';
import * as contentSchema from './schema';


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

router.post('/dashboard',
  validator(contentSchema.getDashboardPosts, 'body'),
  authToken.verifyToken,
  content.getDashboardPosts
);

export default router;
