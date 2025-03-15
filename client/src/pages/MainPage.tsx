import { useState } from 'react';
import { mbti } from '../data/mbti';

function MainPage() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedMbti, setSelectedMbti] = useState('ENFP');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const connectWebSocket = () => {
    if (ws) {
      alert('이미 연결되어 있습니다.');
      return;
    }

    const socket = new WebSocket('ws://localhost:5001');

    socket.onopen = () => {
      console.log('WebSocket 연결');
      socket.send(`${selectedMbti} 님이 입장했습니다.`);
    };

    socket.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    socket.onclose = () => {
      console.log('WebSocket 연결 종료');
      setWs(null);
      setChatOpen(false);
    };

    setWs(socket);
    setChatOpen(true);
  };

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
    <main className="container">
      <h1>MBTI 랜덤 채팅</h1>

      {!chatOpen ? (
        <>
          <p>✨ 당신의 MBTI를 선택해 주세요 ✨</p>
          <select className="select" value={selectedMbti} onChange={(e) => setSelectedMbti(e.target.value)}>
            {mbti.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button type="button" onClick={connectWebSocket}>
            랜덤 채팅 START!
          </button>
        </>
      ) : (
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
        </div>
      )}
    </main>
  );
}

export default MainPage;
