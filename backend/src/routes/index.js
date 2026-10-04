import { Router } from 'express';
import authRoutes from './auth.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import fineRoutes from './fine.routes.js';
import disputeRoutes from './dispute.routes.js';
import stationRoutes from './station.routes.js';
import statsRoutes from './stats.routes.js';
import cameraRoutes from './camera.routes.js';
import { authController } from '../controllers/auth.controller.js';
import { isPostgresConnected } from '../config/db.js';

const apiRouter = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'E-Mobility Shared Backend API',
    timestamp: new Date().toISOString(),
    database: isPostgresConnected() ? 'PostgreSQL CONNECTED' : 'In-Memory Fallback',
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── Feature Routes ───────────────────────────────────────────────────────────
apiRouter.use('/auth', authRoutes);
apiRouter.get('/users', authController.getUsers);
apiRouter.use('/vehicles', vehicleRoutes);
apiRouter.use('/fines', fineRoutes);
apiRouter.use('/disputes', disputeRoutes);
apiRouter.use('/stations', stationRoutes);
apiRouter.use('/cameras', cameraRoutes);
apiRouter.use('/', statsRoutes);

export default apiRouter;

