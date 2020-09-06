import express from 'express';
const router = express.Router();

// Middleware
import { user, authToken } from '@authMiddleware/index';
router.post('/verify', authToken.verifyToken, user.authCheck);


// Routes
import profileRouter from './profile/profileRouter';
router.use('/profile', profileRouter);

import accountRouter from './account/accountRouter';
router.use('/account', accountRouter);

import settingsRouter from './settings/settingsRouter';
router.use('/settings', settingsRouter);

import followsRouter from './follows/followsRouter';
router.use('/follows', followsRouter);

import contentRouter from './content/contentRouter';
router.use('/content', contentRouter);

export default router;
