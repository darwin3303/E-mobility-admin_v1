import { Router } from 'express';
import { disputeController } from '../controllers/dispute.controller.js';

const router = Router();

router.get('/', disputeController.getDisputes);
router.post('/', disputeController.fileDispute);

export default router;
