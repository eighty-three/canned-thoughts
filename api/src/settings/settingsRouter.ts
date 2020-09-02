import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as settings from './settingsController';
import * as settingsSchema from './settings.schema';
const settingsRoutes = ['/username', '/password', '/delete'];

router.post(settingsRoutes, authToken.verifyToken, authAccount.checkPassword);
router.post('/username', validator(settingsSchema.changeUsername, 'body'), authAccount.replaceExistingUsername, settings.changeUsername);
router.post('/password', validator(settingsSchema.changePassword, 'body'), settings.changePassword);
router.post('/delete', validator(settingsSchema.deleteAccount, 'body'), settings.deleteAccount);

export default router;
