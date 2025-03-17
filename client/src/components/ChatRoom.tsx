import { useState, useEffect } from 'react';

interface ChatRoomProps {
  ws: WebSocket | null;
  onClose: () => void;
  selectedMbti: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ ws, onClose, selectedMbti }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  // 웹소켓 메시지 수신
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      setMessages((prev) => [...prev, event.data]);
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

    if (message.trim() !== '') {
      ws.send(`${selectedMbti}: ${message}`);
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
