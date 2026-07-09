import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('WS Connected');
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('WS Disconnected');
      // Simple reconnect logic for dev
      setTimeout(() => {
        if (!isConnected) {
          console.log('Attempting to reconnect...');
          // In real app, you'd trigger a state change to remount or reconnect
        }
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WS Error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  // Handle message callback separately to avoid reconnecting on every render
  useEffect(() => {
    if (ws.current) {
      ws.current.onmessage = onMessage;
    }
  }, [onMessage]);

  const sendMessage = useCallback((data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } else {
      console.warn("WebSocket not connected, can't send message.");
    }
  }, []);

  return { isConnected, sendMessage };
}
