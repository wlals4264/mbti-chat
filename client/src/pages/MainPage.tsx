import { useState } from 'react';
import { mbti } from '../data/mbti';
import ChatRoom from '../components/ChatRoom';

const MainPage: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedMbti, setSelectedMbti] = useState<string>('');
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  // 웹소켓 연결
  const connectWebSocket = () => {
    if (ws) {
      alert('이미 연결되어 있습니다.');
      return;
    }

    if (selectedMbti === '') {
      alert('MBTI를 선택하세요.');
      return;
    }

    const socket = new WebSocket('ws://localhost:5001');

    socket.onopen = () => {
      console.log('WebSocket 연결됨');
      socket.send(`${selectedMbti}님이 입장했습니다.`);
    };

    socket.onclose = () => {
      console.log('WebSocket 연결 종료');
      setWs(null);
      setChatOpen(false);
    };

    setWs(socket);
    setChatOpen(true);
  };

  // 채팅방 종료
  // TODO: 조건 설정
  const closeChat = () => {
    if (ws) {
      ws.close();
    }
  };

  return (
    <main className="container">
      <h1>MBTI 랜덤 채팅</h1>

      {!chatOpen ? (
        <>
          <p>✨ 당신의 MBTI를 선택해 주세요 ✨</p>
          <select className="select" value={selectedMbti} onChange={(e) => setSelectedMbti(e.target.value)}>
            {['', ...mbti].map((value) => (
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
        <ChatRoom ws={ws} onClose={closeChat} selectedMbti={selectedMbti} />
      )}
    </main>
  );
};

export default MainPage;
