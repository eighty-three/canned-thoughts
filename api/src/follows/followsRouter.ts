import express from 'express';
const router = express.Router();

//Middleware
import { authToken } from '@authMiddleware/index';

import * as follows from './followsController';
router.post('/toggle', authToken.verifyToken, follows.toggleFollowStatus);
router.post('/check', follows.checkIfFollowed);

export default router;
