import express from 'express';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as account from './accountController';
const accountRoutes = ['/login', '/signup'];
router.post(accountRoutes, authToken.verifyExistingToken);
router.post('/login', authAccount.checkPassword, account.login);
router.post('/signup', authAccount.checkExistingUsername, account.signup);
router.post('/logout', account.logout);

export default router;
