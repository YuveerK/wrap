import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as controller from './notifications.controller.js';

const router = Router();

router.use(authenticate);
router.post('/token', controller.registerToken);

export default router;
