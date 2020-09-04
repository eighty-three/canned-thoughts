import * as dbSetup from '@utils/dbSetup';

afterAll(async () => {
  await dbSetup.resetDatabase();
});

