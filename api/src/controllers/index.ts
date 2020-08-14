import express from 'express';
const router = express.Router();

//Middleware
import * as authAccount from './authAccount';
import * as authToken from './authToken';
import { authCheck } from './user';
router.post('/verify', authToken.verifyToken, authCheck);


import * as account from './account';
const accountRoutes = ['/account/login', '/account/signup'];
router.post(accountRoutes, authToken.verifyExistingToken);
router.post('/account/login', authAccount.checkPassword, account.login);
router.post('/account/signup', authAccount.checkExistingUsername, account.signup);


import * as settings from './settings';
const settingsRoutes = ['/settings/username', '/settings/password', '/settings/delete'];
router.post(settingsRoutes, authToken.verifyToken, authAccount.checkPassword);
router.post('/settings/username', authAccount.replaceExistingUsername, settings.changeUsername);
router.post('/settings/password', settings.changePassword);
router.post('/settings/delete', settings.deleteAccount);
router.post('/settings/logout', settings.logout);


import * as content from './content';
const contentRoutes = ['/content/thought'];
router.post(contentRoutes, authToken.verifyToken);
router.post('/content/thought', content.createThought);


import * as profile from './profile';
const profileRoutes = ['/profile/update'];
router.post(profileRoutes, authToken.verifyToken);
router.post('/profile/update', profile.updateNameAndDescription);
router.post('/profile/getinfo', authAccount.checkIfUsernameExists, profile.getNameAndDescription); //
router.post('/profile/getall', profile.getAllProfileInfo); //


import * as follows from './follows';
const followsRoutes = ['/follows/toggle'];
router.post(followsRoutes, authToken.verifyToken);
router.post('/follows/toggle', follows.toggleFollowStatus);
router.post('/follows/check', follows.checkIfFollowed);
router.post('/follows/count', follows.getFollowersCount);


export default router;
