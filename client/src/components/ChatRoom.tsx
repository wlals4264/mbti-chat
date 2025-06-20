import { useState, useEffect, useRef } from 'react';

interface ChatRoomProps {
  ws: WebSocket | null;
  onClose: () => void;
  selectedMbti: string;
  sendMessage: (message: string, selectedMbti: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ ws, onClose, selectedMbti, sendMessage }) => {
  const [messages, setMessages] = useState<{ mbti: string; text: string; isOwnMessage: boolean }[]>([]);
  const [message, setMessage] = useState<string>('');

  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ws) return;

    if (messages) {
      console.log(messages);
    }

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
  }, [ws, messages, onClose]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage(message, selectedMbti);
      setMessage('');
    }
  };

  const handleClick = () => {
    sendMessage(message, selectedMbti);
    setMessage('');
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
          {messages.map((msg, index) =>
            msg.mbti === 'System' ? (
              <div key={index} className="system-message">
                {msg.text}
              </div>
            ) : (
              <li key={index} className={msg.isOwnMessage ? 'my-message' : 'opponent-message'}>
                <span>{msg.mbti}</span>
                <p>{msg.text}</p>
              </li>
            )
          )}
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
