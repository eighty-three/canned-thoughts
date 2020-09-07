import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken } from '@authMiddleware/index';

import * as follows from './controller';
import * as followsSchema from './schema';


router.get('/check',
  validator(followsSchema.checkIfFollowed, 'query'),
  follows.checkIfFollowed
);

router.post('/toggle',
  validator(followsSchema.toggleFollowStatus, 'body'),
  authToken.verifyToken,
  follows.toggleFollowStatus
);

export default router;
