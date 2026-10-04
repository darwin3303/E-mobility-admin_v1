import app from './app.js';
import { initDatabase } from './config/db.js';
import { config } from './config/env.js';
import { realtimeService } from './services/realtime.service.js';
import { cameraWatchdog } from './services/watchdog.service.js';
import { verifySmtpConnection } from './services/email.service.js';

// Initialize Database on Startup
initDatabase();

// Verify SMTP Connection on Startup (non-blocking)
verifySmtpConnection().catch(() => {});

// Start HTTP Server
const server = app.listen(config.port, '0.0.0.0', () => {
  // Initialize Real-time WebSocket Hub & Health Watchdog
  realtimeService.init(server);
  cameraWatchdog.start();

  console.log(`\n======================================================`);
  console.log(`🚀 E-Mobility Shared Backend API Server Online!`);
  console.log(`📍 Port: ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`📍 WebSocket Gateway: ws://localhost:${config.port}/ws`);
  console.log(`📍 Health check: http://localhost:${config.port}/api/health`);
  console.log(`📍 API Base: http://localhost:${config.port}/api`);
  console.log(`📍 Admin Portal: ${config.adminFrontendUrl}`);
  console.log(`📍 Vehicle Portal: ${config.vehiclePortalUrl}`);
  console.log(`======================================================\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down shared backend server...');
  server.close(() => {
    console.log('Server closed. Goodbye!');
    process.exit(0);
  });
});

export default server;