import express from 'express';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';
import { isPostgresConnected } from './config/db.js';
import { config } from './config/env.js';

const app = express();

// Global Middlewares
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Root Welcome / Interactive API Status Page
app.get('/', (req, res) => {
  const dbStatus = isPostgresConnected() ? 'CONNECTED' : 'STANDBY (IN-MEMORY SIMULATION)';
  const dbColor = isPostgresConnected() ? '#22c55e' : '#f59e0b';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>E-Mobility Shared Backend API Server</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: #1e293b;
            border: 1px solid #334155;
            padding: 32px 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            max-width: 580px;
            width: 100%;
          }
          .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(34, 197, 94, 0.15);
            border: 1px solid #22c55e;
            color: #4ade80;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 13px;
            margin-bottom: 12px;
          }
          .db-status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.05);
            border: 1px solid ${dbColor};
            color: ${dbColor};
            padding: 4px 14px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 12px;
            margin-bottom: 20px;
          }
          .dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            box-shadow: 0 0 10px #22c55e;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 24px;
            color: #ffffff;
          }
          p {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 20px;
            line-height: 1.5;
          }
          .apps-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
          }
          .app-badge {
            background: #0f172a;
            border: 1px solid #334155;
            padding: 12px;
            border-radius: 12px;
            text-align: left;
          }
          .app-badge strong {
            display: block;
            color: #38bdf8;
            font-size: 13px;
            margin-bottom: 2px;
          }
          .app-badge span {
            font-size: 11px;
            color: #64748b;
            font-family: monospace;
          }
          ul {
            text-align: left;
            background: #0f172a;
            padding: 16px 20px;
            border-radius: 12px;
            font-family: monospace;
            font-size: 13px;
            color: #38bdf8;
            list-style: none;
            margin: 0;
            max-height: 180px;
            overflow-y: auto;
          }
          li {
            padding: 4px 0;
          }
          a {
            color: #38bdf8;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="status"><span class="dot"></span> SHARED BACKEND ONLINE (PORT ${config.port})</div><br>
          <div class="db-status">🗄️ PostgreSQL Database: ${dbStatus}</div>
          <h1>E-Mobility Shared Backend API</h1>
          <p>Common REST API backend serving both the Admin Dashboard and Citizen Vehicle Portal.</p>
          
          <div class="apps-grid">
            <div class="app-badge">
              <strong>Admin Dashboard</strong>
              <span>http://localhost:5173</span>
            </div>
            <div class="app-badge">
              <strong>Vehicle Portal</strong>
              <span>http://localhost:5174</span>
            </div>
          </div>

          <ul>
            <li>GET <a href="/api/health">/api/health</a></li>
            <li>GET <a href="/api/stats">/api/stats</a></li>
            <li>POST /api/auth/login</li>
            <li>POST /api/auth/register</li>
            <li>POST /api/auth/otp/request</li>
            <li>POST /api/auth/otp/verify</li>
            <li>GET <a href="/api/vehicles">/api/vehicles</a></li>
            <li>GET <a href="/api/fines">/api/fines</a></li>
            <li>GET <a href="/api/disputes">/api/disputes</a></li>
            <li>GET <a href="/api/stations">/api/stations</a></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Mount /api Routes
app.use('/api', apiRouter);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
