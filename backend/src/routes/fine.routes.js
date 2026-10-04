import { Router } from 'express';
import { fineController } from '../controllers/fine.controller.js';

const router = Router();

router.get('/', fineController.getFines);
router.post('/violations', fineController.recordViolation);
router.get('/:id', fineController.getFineById);
router.post('/pay', fineController.payFine);
router.post('/:id/pay', fineController.payFine);
router.post('/dispute', fineController.disputeFine);
router.post('/:id/dispute', fineController.disputeFine);

export default router;
