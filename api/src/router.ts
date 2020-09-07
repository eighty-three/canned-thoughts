import express from 'express';
const router = express.Router();

// Middleware
import { user, authToken } from '@authMiddleware/index';
router.post('/verify', authToken.verifyToken, user.authCheck);


// Routes
import profileRouter from './profile/router';
router.use('/profile', profileRouter);

import accountRouter from './account/router';
router.use('/account', accountRouter);

import settingsRouter from './settings/router';
router.use('/settings', settingsRouter);

import followsRouter from './follows/router';
router.use('/follows', followsRouter);

import contentRouter from './content/router';
router.use('/content', contentRouter);

export default router;
