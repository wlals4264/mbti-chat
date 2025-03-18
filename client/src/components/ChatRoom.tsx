import { useState, useEffect } from 'react';

interface ChatRoomProps {
  ws: WebSocket | null;
  onClose: () => void;
  selectedMbti: string;
  roomId: string | null;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ ws, onClose, selectedMbti, roomId }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  // 웹소켓 메시지 수신
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.text]);
      } else if (data.type === 'exit') {
        alert('상대방이 채팅을 종료했습니다.');
        onClose();
      }
    };

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws]);

  // 메시지 전송
  const sendMessage = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert('서버와 연결되지 않았습니다.');
      return;
    }

    if (message.trim() !== '' && roomId) {
      ws.send(JSON.stringify({ type: 'message', text: `${selectedMbti}: ${message}`, roomId }));
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button onClick={sendMessage}>전송</button>
      </div>
      <button onClick={onClose} className="exit-button">
        채팅 종료
      </button>
    </div>
  );
};

export default ChatRoom;
