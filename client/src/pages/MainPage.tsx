import { useState } from 'react';
import { mbti } from '../data/mbti';
import ChatRoom from '../components/ChatRoom';
import Spinner from '../components/Spinner';

const MainPage: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedMbti, setSelectedMbti] = useState<string>('');
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [waiting, setWaiting] = useState<boolean>(false);

  // 웹소켓 연결 및 랜덤 매칭 요청
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
      console.log('✅ WebSocket 연결됨');

      // 서버에 랜덤 매칭 요청
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
  };

  // 채팅방 종료
  const closeChat = () => {
    if (ws) {
      ws.send(JSON.stringify({ type: 'exit', roomId }));
      ws.close();
    }
  };

  return (
    <main className="container">
      <h1>MBTI 랜덤 채팅</h1>

      {!chatOpen ? (
        <>
          <p>✨ MBTI를 선택해 주세요 ✨</p>
          <select className="select" value={selectedMbti} onChange={(e) => setSelectedMbti(e.target.value)}>
            <option value="" disabled>
              클릭해서 MBTI 선택
            </option>
            {mbti.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button type="button" onClick={connectWebSocket} disabled={waiting}>
            {waiting ? (
              <>
                <Spinner />
                매칭 중...
              </>
            ) : (
              '랜덤 채팅 START!'
            )}
          </button>
        </>
      ) : (
        <ChatRoom ws={ws} onClose={closeChat} selectedMbti={selectedMbti} roomId={roomId} />
      )}
    </main>
  );
};

export default MainPage;
