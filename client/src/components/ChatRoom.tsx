import { useState, useEffect, useRef } from 'react';

interface ChatRoomProps {
  ws: WebSocket | null;
  onClose: () => void;
  selectedMbti: string;
  roomId: string | null;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ ws, onClose, selectedMbti, roomId }) => {
  const [messages, setMessages] = useState<{ mbti: string; text: string; isOwnMessage: boolean }[]>([]);
  const [message, setMessage] = useState<string>('');

  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  // 웹소켓 메시지 수신
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        setMessages((prev) => [...prev, { mbti: data.mbti, text: data.text, isOwnMessage: data.isOwnMessage }]);
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
      const messageData = {
        type: 'message',
        mbti: selectedMbti,
        text: message,
        roomId,
        isOwnMessage: true,
      };
      ws.send(JSON.stringify(messageData));
      setMessage('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleClick = () => {
    sendMessage();
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="chat-container">
        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <li key={index} className={msg.isOwnMessage ? 'my-message' : 'opponent-message'}>
              <span>{msg.mbti}</span>
              <p>{msg.text}</p>
            </li>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
          />
          <button onClick={handleClick}>전송</button>
        </div>
      </div>
      <button onClick={onClose} className="exit-button">
        채팅 종료
      </button>
    </>
  );
};

export default ChatRoom;
