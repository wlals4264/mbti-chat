import { useCallback } from 'react';

export default function useSendMessage(ws: WebSocket | null, roomId: string | null) {
  return useCallback(
    (message: string, selectedMbti: string) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert('서버와 연결되지 않았습니다.');
        return;
      }

      if (message.trim() !== '' && roomId) {
        const messageData = {
          type: 'message',
          mbti: selectedMbti,
          text: message,
          roomId,
          isOwnMessage: true,
        };
        ws.send(JSON.stringify(messageData));
      }
    },
    [ws, roomId]
  );
}
