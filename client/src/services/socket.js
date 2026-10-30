class OpticGuardSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectTimeout = null;
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const envWsUrl = import.meta.env.VITE_WS_URL;
    let wsUrl = envWsUrl;

    if (!wsUrl || wsUrl === '' || wsUrl.includes('your-render-url')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notify('connection_change', { connected: true });
        console.log('[OpticGuard WS] Connected to visual stream hub at:', wsUrl);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notify(data.type, data.payload, data.timestamp);
          this.notify('*', data);
        } catch (e) {
          console.warn('[OpticGuard WS] Non-JSON message received', event.data);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notify('connection_change', { connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[OpticGuard WS] Socket error', err);
        this.ws.close();
      };
    } catch (err) {
      console.error('[OpticGuard WS] Failed to initiate connection', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 3000);
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
    return () => this.off(type, callback);
  }

  off(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  notify(type, payload, timestamp) {
    if (this.listeners.has(type)) {
      for (const cb of this.listeners.get(type)) {
        try {
          cb(payload, timestamp);
        } catch (err) {
          console.error('[OpticGuard WS] Listener error:', err);
        }
      }
    }
  }

  send(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
    }
  }
}

export const socket = new OpticGuardSocket();
