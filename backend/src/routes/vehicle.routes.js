import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller.js';

const router = Router();

// National Vehicle Registry Lookup (7,000 Records)
router.get('/lookup/:plate', vehicleController.lookup);
router.get('/lookup', vehicleController.lookup);

// Citizen Vehicle Management
router.get('/', vehicleController.getAll);
router.post('/', vehicleController.addVehicle);

export default router;
