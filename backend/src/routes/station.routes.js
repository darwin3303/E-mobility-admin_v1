import { Router } from 'express';
import { stationController } from '../controllers/station.controller.js';

const router = Router();

router.get('/', stationController.getStations);
router.get('/:id', stationController.getStationById);

export default router;
