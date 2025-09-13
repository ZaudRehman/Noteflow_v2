import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";

const WS_RECONNECT_INTERVAL = 3000;

type WSMessage = {
  noteId: string;
  content: string;
};

type UseWebSocketProps = {
  noteId: string;
  onMessage: (message: WSMessage) => void;
  enabled?: boolean;
};

export function useWebSocket({ noteId, onMessage, enabled = true }: UseWebSocketProps) {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (!enabled || !noteId || !token) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = new URL(`${protocol}://${window.location.host}/api/notes/${noteId}/ws`);
    wsUrl.searchParams.append("token", token);

    wsRef.current = new WebSocket(wsUrl.toString());

    wsRef.current.onopen = () => {
      setConnected(true);
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      console.log(`[WebSocket] Connected to note ${noteId}`);
    };

    wsRef.current.onmessage = (event) => {
      try {
        if (typeof event.data === "string") {
          // Parse message like "noteId:content"
          const [msgNoteId, ...rest] = event.data.split(":");
          const content = rest.join(":");
          if (msgNoteId && content) {
            onMessage({ noteId: msgNoteId, content });
          }
        }
      } catch (error) {
        console.error("[WebSocket] Failed to parse message", error);
      }
    };

    wsRef.current.onerror = (event) => {
      console.error("[WebSocket] Error:", event);
    };

    wsRef.current.onclose = (event) => {
      setConnected(false);
      console.warn(`[WebSocket] Disconnected (code: ${event.code}), reconnecting in ${WS_RECONNECT_INTERVAL}ms...`);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnectTimer.current = window.setTimeout(connect, WS_RECONNECT_INTERVAL);
    };
  }, [noteId, token, onMessage, enabled]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (content: string) => {
      if (connected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const msg = `${noteId}:${content}`;
        wsRef.current.send(msg);
      } else {
        console.warn("[WebSocket] Cannot send message, not connected");
      }
    },
    [connected, noteId]
  );

  return { connected, sendMessage };
}
