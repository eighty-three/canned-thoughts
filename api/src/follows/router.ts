import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as follows from './controller';
import * as followsSchema from './schema';

router.post('/toggle',
  validator(followsSchema.toggleFollowStatus, 'body'),
  authToken.verifyToken,
  authAccount.checkIfUsernamesExist,
  follows.toggleFollowStatus
);

export default router;
