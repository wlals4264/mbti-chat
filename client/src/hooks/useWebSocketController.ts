import { useState, useCallback } from 'react';

interface UseWebSocketController {
  ws: WebSocket | null;
  waiting: boolean;
  chatOpen: boolean;
  connectWebSocket: (selectedMbti: string) => void;
  closeChat: () => void;
  sendMessage: (message: string, selectedMbti: string) => void;
}

const useWebSocketController = (): UseWebSocketController => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  // 웹소켓 연결 및 매칭 요청
  const connectWebSocket = useCallback(
    (selectedMbti: string) => {
      if (ws) {
        alert('이미 연결되어 있습니다.');
        return;
      }

      if (!selectedMbti) {
        alert('MBTI를 선택하세요.');
        return;
      }

      const socket = new WebSocket('ws://localhost:5001');

      socket.onopen = () => {
        console.log('✅ WebSocket 연결됨');
        socket.send(JSON.stringify({ type: 'join' }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'waiting') {
          setWaiting(true);
          console.log('⏳ 대기열에 추가됨...');
        } else if (data.type === 'matched') {
          console.log(`🎉 매칭 완료! roomId: ${data.roomId}`);
          setRoomId(data.roomId);
          setChatOpen(true);
          setWaiting(false);
        }
      };

      socket.onclose = () => {
        console.log('🚪 WebSocket 연결 종료');
        setWs(null);
        setChatOpen(false);
        setRoomId(null);
        setWaiting(false);
      };

      setWs(socket);
    },
    [ws]
  );

  // 채팅방 종료
  const closeChat = useCallback(() => {
    if (ws && roomId) {
      ws.send(JSON.stringify({ type: 'exit', roomId }));
      ws.close();
    }
  }, [ws, roomId]);

  // 메시지 전송
  const sendMessage = useCallback(
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

  return {
    ws,
    waiting,
    chatOpen,
    connectWebSocket,
    closeChat,
    sendMessage,
  };
};

export default useWebSocketController;
