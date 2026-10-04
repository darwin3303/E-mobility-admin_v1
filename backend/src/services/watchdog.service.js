import http from 'http';
import { realtimeService } from './realtime.service.js';

class CameraWatchdogService {
  constructor() {
    this.aiServerUrl = process.env.AI_SERVER_URL || 'http://localhost:8000';
    this.checkIntervalMs = 1500;
    this.timer = null;
    this.cameraHealthState = {};
    this.isAiServerOnline = false;
  }

  start() {
    console.log('🛡️ Camera & AI Health Watchdog Service Started...');
    this.timer = setInterval(() => this.checkHealth(), this.checkIntervalMs);
    this.checkHealth(); // Immediate initial check
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async checkHealth() {
    try {
      const data = await this.fetchJson(`${this.aiServerUrl}/api/telemetry`);
      this.isAiServerOnline = true;
      this.cameraHealthState = data.nodes || {};

      // Broadcast fresh telemetry and camera health to all connected clients
      realtimeService.broadcast('TELEMETRY_UPDATE', data);

      if (data.recentIncidents && data.recentIncidents.length > 0) {
        realtimeService.broadcast('INCIDENT_ALERT', data.recentIncidents[0]);
      }
    } catch (err) {
      if (this.isAiServerOnline) {
        console.warn('⚠️ AI Traffic Vision Server unreachable:', err.message);
      }
      this.isAiServerOnline = false;
      realtimeService.broadcast('AI_SERVER_STATUS', {
        status: 'OFFLINE',
        message: 'AI Vision Engine is restarting or offline',
        timestamp: Date.now()
      });
    }
  }

  fetchJson(urlStr) {
    return new Promise((resolve, reject) => {
      const req = http.get(urlStr, { timeout: 1200 }, (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(raw));
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  getStatus() {
    return {
      aiServerOnline: this.isAiServerOnline,
      cameras: this.cameraHealthState,
      timestamp: Date.now()
    };
  }
}

export const cameraWatchdog = new CameraWatchdogService();
