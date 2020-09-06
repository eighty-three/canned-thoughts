import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as profile from './profileController';
import * as profileSchema from './profile.schema';


router.post('/update',
  validator(profileSchema.updateNameAndDescription, 'body'),
  authToken.verifyToken,
  profile.updateNameAndDescription
);

router.post('/getinfo',
  validator(profileSchema.getNameAndDescription, 'body'),
  authAccount.checkIfUsernameExists,
  profile.getNameAndDescription
);

router.post('/getall',
  validator(profileSchema.getProfileInfo, 'body'),
  authAccount.checkIfUsernameExists,
  profile.getProfileInfo
);

export default router;
