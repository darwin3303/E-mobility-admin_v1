import { Router } from 'express';
import { statsController } from '../controllers/stats.controller.js';

const router = Router();

router.get('/health', statsController.getHealth);
router.get('/stats', statsController.getOverviewStats);

export default router;
