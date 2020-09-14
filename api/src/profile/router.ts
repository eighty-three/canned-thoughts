import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as profile from './controller';
import * as profileSchema from './schema';


router.post('/update',
  validator(profileSchema.updateNameAndDescription, 'body'),
  authToken.verifyToken,
  profile.updateNameAndDescription
);

router.get('/getinfo',
  validator(profileSchema.getNameAndDescription, 'query'),
  profile.getNameAndDescription
);

router.get('/getall',
  validator(profileSchema.getProfileInfo, 'query'),
  authAccount.checkIfUsernameExists,
  profile.getProfileInfo
);

export default router;
