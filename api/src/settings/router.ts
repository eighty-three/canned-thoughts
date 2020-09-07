import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as settings from './controller';
import * as settingsSchema from './schema';


router.post('/username',
  validator(settingsSchema.changeUsername, 'body'),
  authToken.verifyToken,
  authAccount.checkPassword,
  authAccount.replaceExistingUsername,
  settings.changeUsername
);

router.post('/password',
  validator(settingsSchema.changePassword, 'body'),
  authToken.verifyToken,
  authAccount.checkPassword,
  settings.changePassword
);

router.post('/delete',
  validator(settingsSchema.deleteAccount, 'body'),
  authToken.verifyToken,
  authAccount.checkPassword,
  settings.deleteAccount
);

export default router;
