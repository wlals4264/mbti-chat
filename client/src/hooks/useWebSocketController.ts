import { useState, useCallback } from 'react';

interface UseWebSocketController {
  ws: WebSocket | null;
  waiting: boolean;
  chatOpen: boolean;
  connectWebSocket: (selectedMbti: string) => void;
  roomId: string | null;
}

const useWebSocketController = (): UseWebSocketController => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  const connectWebSocket = useCallback(() => {
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

    socket.onerror = () => {
      console.log('🥲 WebSocket Error');
    };

    socket.onclose = () => {
      console.log('🚪 WebSocket 연결 종료');
      setWs(null);
      setChatOpen(false);
      setRoomId(null);
      setWaiting(false);
    };

    setWs(socket);
  }, [ws]);

  return {
    ws,
    waiting,
    chatOpen,
    connectWebSocket,
    roomId,
  };
};

export default useWebSocketController;
