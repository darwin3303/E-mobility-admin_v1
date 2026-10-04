import express from 'express';
import { cameraWatchdog } from '../services/watchdog.service.js';
import { realtimeService } from '../services/realtime.service.js';

const router = express.Router();

/**
 * GET /api/cameras
 * List all active highway CCTV nodes and their operational health
 */
router.get('/', (req, res) => {
  const status = cameraWatchdog.getStatus();
  res.json({
    success: true,
    aiServerOnline: status.aiServerOnline,
    cameras: status.cameras,
    timestamp: status.timestamp
  });
});

/**
 * GET /api/cameras/events/stream
 * Server-Sent Events (SSE) Live Stream
 */
router.get('/events/stream', (req, res) => {
  realtimeService.registerSSE(req, res);
});

export default router;
