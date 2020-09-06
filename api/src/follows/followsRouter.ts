import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken } from '@authMiddleware/index';

import * as follows from './followsController';
import * as followsSchema from './follows.schema';


router.post('/check',
  validator(followsSchema.checkIfFollowed, 'body'),
  follows.checkIfFollowed
);

router.post('/toggle',
  validator(followsSchema.toggleFollowStatus, 'body'),
  authToken.verifyToken,
  follows.toggleFollowStatus
);

export default router;
