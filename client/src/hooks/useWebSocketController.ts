import { useState, useCallback } from 'react';

interface UseWebSocketController {
  ws: WebSocket | null;
  isLoading: boolean;
  chatOpen: boolean;
  connectWebSocket: () => void;
  roomId: string | null;
}

const useWebSocketController = (): UseWebSocketController => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  const connectWebSocket = useCallback(() => {
    if (ws) {
      alert('이미 연결되어 있습니다.');
      return;
    }

    // const socket = new WebSocket('ws://localhost:5001'); // 로컬
    const socket = new WebSocket('wss://mbti-chat.onrender.com'); // 서버

    socket.onopen = () => {
      console.log('✅ WebSocket 연결됨');
      socket.send(JSON.stringify({ type: 'join' }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'waiting') {
        setIsLoading(true);
        console.log('⏳ 대기열에 추가됨...');
      } else if (data.type === 'matched') {
        console.log(`🎉 매칭 완료! roomId: ${data.roomId}`);
        setRoomId(data.roomId);
        setChatOpen(true);
        setIsLoading(false);
      }
    };

    socket.onerror = () => {
      console.log('🥲 WebSocket Error');
    };

    socket.onclose = () => {
      console.log('🚪 WebSocket 연결 종료');
      setWs(null);
      setChatOpen(false);
      setRoomId(null);
      setIsLoading(false);
    };

    setWs(socket);
  }, [ws]);

  return {
    ws,
    isLoading,
    chatOpen,
    connectWebSocket,
    roomId,
  };
};

export default useWebSocketController;
