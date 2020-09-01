import express from 'express';
const router = express.Router();

//Middleware
import { authToken, authAccount } from '@authMiddleware/index';

import * as settings from './settingsController';
const settingsRoutes = ['/username', '/password', '/delete'];
router.post(settingsRoutes, authToken.verifyToken, authAccount.checkPassword);
router.post('/username', authAccount.replaceExistingUsername, settings.changeUsername);
router.post('/password', settings.changePassword);
router.post('/delete', settings.deleteAccount);

export default router;
