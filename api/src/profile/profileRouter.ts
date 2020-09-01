import express from 'express';
const router = express.Router();

//Middleware
import { authToken, authAccount } from '@authMiddleware/index';

import * as profile from './profileController';
router.post('/update', authToken.verifyToken, profile.updateNameAndDescription);
router.post('/getinfo', authAccount.checkIfUsernameExists, profile.getNameAndDescription);
router.post('/getall', authAccount.checkIfUsernameExists, profile.getProfileInfo);

export default router;
