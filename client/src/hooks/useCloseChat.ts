import { useCallback } from 'react';

export function useCloseChat(ws: WebSocket | null, roomId: string | null) {
  return useCallback(() => {
    if (ws && roomId) {
      ws.send(JSON.stringify({ type: 'exit', roomId }));
      ws.close();
    }
  }, [ws, roomId]);
}
