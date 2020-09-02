import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as account from './accountController';
import * as accountSchema from './account.schema';
const accountRoutes = ['/login', '/signup'];

router.post(accountRoutes, authToken.verifyExistingToken);
router.post('/login', validator(accountSchema.login, 'body'), authAccount.checkPassword, account.login);
router.post('/signup', validator(accountSchema.signup, 'body'), authAccount.checkExistingUsername, account.signup);
router.post('/logout', validator(accountSchema.logout, 'body'), account.logout);

export default router;
