import { WebSocketServer, WebSocket } from 'ws';

class RealtimeService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
    this.latestTelemetry = null;
    this.sseClients = new Set();
  }

  /**
   * Attach WebSocket Server to existing Node.js HTTP Server
   */
  init(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      this.clients.add(ws);
      console.log(`📡 Admin Dashboard connected via WebSocket to Backend (Total: ${this.clients.size})`);

      // Send immediate cached telemetry state if available
      if (this.latestTelemetry) {
        ws.send(JSON.stringify({ type: 'TELEMETRY_SNAPSHOT', data: this.latestTelemetry }));
      }

      ws.on('message', (message) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.action === 'ping') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          }
        } catch (err) {
          // Ignore malformed messages
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`📡 WebSocket client disconnected. Remaining: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.warn('WebSocket client error:', err.message);
        this.clients.delete(ws);
      });
    });

    console.log('⚡ Shared Backend Real-Time WebSocket Gateway Initialized on /ws');
  }

  /**
   * Broadcast message to all connected WebSocket clients
   */
  broadcast(type, data) {
    if (type === 'TELEMETRY_UPDATE') {
      this.latestTelemetry = data;
    }

    const payload = JSON.stringify({ type, data, timestamp: Date.now() });

    // 1. Push to WebSockets
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }

    // 2. Push to SSE Clients
    for (const res of this.sseClients) {
      try {
        res.write(`data: ${payload}\n\n`);
      } catch (e) {
        this.sseClients.delete(res);
      }
    }
  }

  /**
   * Register SSE response stream
   */
  registerSSE(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    this.sseClients.add(res);

    if (this.latestTelemetry) {
      res.write(`data: ${JSON.stringify({ type: 'TELEMETRY_SNAPSHOT', data: this.latestTelemetry })}\n\n`);
    }

    req.on('close', () => {
      this.sseClients.delete(res);
    });
  }
}

export const realtimeService = new RealtimeService();
