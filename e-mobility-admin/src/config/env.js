/**
 * Dynamic Environment Configuration for E-Mobility Sri Lanka Frontend.
 * Dynamically resolves URLs based on window.location.hostname and protocol (ws:// or wss://).
 * Supports environment variable overrides (VITE_API_URL, VITE_WS_URL, VITE_AI_SERVER_URL).
 */

export const getHost = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

export const getWsProtocol = () => {
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
    return 'wss:';
  }
  return 'ws:';
};

export const getHttpProtocol = () => {
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
    return 'https:';
  }
  return 'http:';
};

export const API_URL = import.meta.env.VITE_API_URL || `${getHttpProtocol()}//${getHost()}:5000/api`;
export const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || `${getHttpProtocol()}//${getHost()}:8000`;
export const WS_AI_URL = import.meta.env.VITE_WS_URL || `${getWsProtocol()}//${getHost()}:8000/ws/live`;
export const WS_BACKEND_URL = `${getWsProtocol()}//${getHost()}:5000/ws`;
