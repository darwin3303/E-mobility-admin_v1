/**
 * E-Mobility Real-Time Client Service
 * Resilient multi-tier live event stream:
 * Priority 1: Direct AI WebSocket (ws://[hostname]:8000/ws/live)
 * Priority 2: Server-Sent Events (SSE /api/stream/events)
 * Priority 3: Graceful Auto-Polling Fallback
 */
import { AI_SERVER_URL, WS_AI_URL } from '../config/env';

class RealtimeClient {
  constructor() {
    this.subscribers = {
      telemetry: new Set(),
      incident: new Set(),
      violation: new Set(),
      connection: new Set(),
    };
    this.ws = null;
    this.sse = null;
    this.pollTimer = null;
    this.status = 'DISCONNECTED';
    this.reconnectTimer = null;
    this.lastTelemetry = null;
    this.isConnecting = false;
    this.isIntentionalClose = false;
  }

  start() {
    this.connect();
  }

  stop() {
    this.isIntentionalClose = true;
    this.isConnecting = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.sse) {
      try {
        this.sse.close();
      } catch (e) {
        // ignore
      }
      this.sse = null;
    }
    if (this.ws) {
      const socket = this.ws;
      this.ws = null;
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (socket.readyState === WebSocket.CONNECTING) {
        socket.onopen = () => {
          try {
            socket.close();
          } catch (e) {
            // ignore
          }
        };
      } else if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.close();
        } catch (e) {
          // ignore
        }
      }
    }

    this._setStatus('DISCONNECTED');
  }

  connect() {
    // Prevent double-connecting under React StrictMode or existing active socket
    if (this.isConnecting) return;
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isIntentionalClose = false;
    this.isConnecting = true;
    this._setStatus('CONNECTING');

    // 1. Try Direct AI Server WebSocket
    try {
      this.ws = new WebSocket(WS_AI_URL);

      this.ws.onopen = () => {
        this.isConnecting = false;
        if (this.isIntentionalClose) {
          this.stop();
          return;
        }
        console.log('⚡ Connected to AI Vision Realtime WebSocket Hub:', WS_AI_URL);
        this._setStatus('CONNECTED_WS');
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this._handleMessage(payload);
        } catch (e) {
          // ignore
        }
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
        if (this.isIntentionalClose) return;
        console.warn('AI WebSocket unreachable, trying SSE stream fallback...');
        this._fallbackToSSE();
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        if (this.isIntentionalClose) return;
        if (this.status === 'CONNECTED_WS') {
          this._setStatus('RECONNECTING');
          this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        }
      };
    } catch (err) {
      this.isConnecting = false;
      if (!this.isIntentionalClose) {
        this._fallbackToSSE();
      }
    }
  }

  _fallbackToSSE() {
    if (this.isIntentionalClose) return;
    if (this.sse) {
      try {
        this.sse.close();
      } catch (e) {
        // ignore
      }
    }

    try {
      this.sse = new EventSource(`${AI_SERVER_URL}/api/stream/events`);

      this.sse.onopen = () => {
        if (this.isIntentionalClose) {
          this.sse?.close();
          this.sse = null;
          return;
        }
        console.log('⚡ Connected to Realtime SSE Event Stream');
        this._setStatus('CONNECTED_SSE');
      };

      this.sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this._handleMessage(payload);
        } catch (e) {
          // ignore
        }
      };

      this.sse.onerror = () => {
        if (this.isIntentionalClose) return;
        console.warn('SSE stream error, dropping to background polling fallback...');
        this.sse?.close();
        this.sse = null;
        this._fallbackToPolling();
      };
    } catch (e) {
      if (!this.isIntentionalClose) {
        this._fallbackToPolling();
      }
    }
  }

  _fallbackToPolling() {
    if (this.isIntentionalClose) return;
    this._setStatus('CONNECTED_POLLING');
    if (this.pollTimer) clearInterval(this.pollTimer);

    const poll = async () => {
      if (this.isIntentionalClose) return;
      try {
        const [telRes, incRes, vioRes] = await Promise.all([
          fetch(`${AI_SERVER_URL}/api/telemetry`).then((r) => r.json()),
          fetch(`${AI_SERVER_URL}/api/incidents`).then((r) => r.json()),
          fetch(`${AI_SERVER_URL}/api/violations`).then((r) => r.json()),
        ]);

        if (telRes && !this.isIntentionalClose) {
          telRes.recentIncidents = incRes.incidents || [];
          telRes.recentViolations = vioRes.violations || [];
          this._handleMessage(telRes);
        }
      } catch (err) {
        // quiet fallback
      }
    };

    poll();
    this.pollTimer = setInterval(poll, 2000);
  }

  _handleMessage(payload) {
    if (!payload) return;

    // Handle telemetry updates
    this.lastTelemetry = payload;
    for (const cb of this.subscribers.telemetry) {
      cb(payload);
    }

    // Handle instant incident alerts
    if (payload.recentIncidents && payload.recentIncidents.length > 0) {
      for (const inc of payload.recentIncidents) {
        for (const cb of this.subscribers.incident) {
          cb(inc);
        }
      }
    }

    // Handle instant violations
    if (payload.recentViolations && payload.recentViolations.length > 0) {
      for (const vio of payload.recentViolations) {
        for (const cb of this.subscribers.violation) {
          cb(vio);
        }
      }
    }
  }

  _setStatus(status) {
    this.status = status;
    for (const cb of this.subscribers.connection) {
      cb(status);
    }
  }

  async setSpeedLimit(limit) {
    const numLimit = Number(limit);
    if (!numLimit) return;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          action: 'set_speed_limit',
          speedLimit: numLimit
        }));
      } catch (e) {
        console.warn('WS send failed:', e);
      }
    }

    try {
      await fetch(`${AI_SERVER_URL}/api/config/speed_limit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speedLimit: numLimit })
      });
    } catch (e) {
      console.warn('REST speed limit sync note:', e);
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  subscribeTelemetry(callback) {
    this.subscribers.telemetry.add(callback);
    if (this.lastTelemetry) callback(this.lastTelemetry);
    return () => this.subscribers.telemetry.delete(callback);
  }

  subscribeIncident(callback) {
    this.subscribers.incident.add(callback);
    return () => this.subscribers.incident.delete(callback);
  }

  subscribeViolation(callback) {
    this.subscribers.violation.add(callback);
    return () => this.subscribers.violation.delete(callback);
  }

  subscribeConnection(callback) {
    this.subscribers.connection.add(callback);
    callback(this.status);
    return () => this.subscribers.connection.delete(callback);
  }
}

export const realtimeClient = new RealtimeClient();
