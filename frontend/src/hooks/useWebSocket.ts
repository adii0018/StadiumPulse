/**
 * @fileoverview useWebSocket hook — WebSocket connection with auto-reconnect.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { GateDensitySnapshot, CrowdAlert, WSMessage } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001/ws/crowd';
const RECONNECT_DELAY_MS = 3000;

interface UseWebSocketReturn {
  snapshots: GateDensitySnapshot[];
  alerts: CrowdAlert[];
  connected: boolean;
}

export function useWebSocket(): UseWebSocketReturn {
  const [snapshots, setSnapshots] = useState<GateDensitySnapshot[]>([]);
  const [alerts, setAlerts] = useState<CrowdAlert[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!unmountedRef.current) setConnected(true);
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      if (unmountedRef.current) return;
      try {
        const msg = JSON.parse(event.data) as WSMessage;
        if (msg.type === 'crowd_update') {
          setSnapshots(msg.payload as GateDensitySnapshot[]);
        } else if (msg.type === 'alert') {
          setAlerts((prev) => {
            const alert = msg.payload as CrowdAlert;
            // Deduplicate by gateId — keep latest
            const filtered = prev.filter((a) => a.gateId !== alert.gateId);
            if (alert.severity === 'low') return filtered;
            return [alert, ...filtered].slice(0, 10);
          });
        }
      } catch {
        // Malformed message — ignore
      }
    };

    ws.onclose = () => {
      if (!unmountedRef.current) {
        setConnected(false);
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    unmountedRef.current = false;
    connect();
    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { snapshots, alerts, connected };
}
