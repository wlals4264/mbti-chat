import { useState } from 'react';
import { mbti } from '../data/mbti';
import ChatRoom from '../components/ChatRoom';
import Spinner from '../components/Spinner';
import useWebSocketController from '../hooks/useWebSocketController';

const MainPage: React.FC = () => {
  const { ws, waiting, chatOpen, connectWebSocket, closeChat, sendMessage } = useWebSocketController();
  const [selectedMbti, setSelectedMbti] = useState<string>('');

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
          <button type="button" onClick={() => connectWebSocket(selectedMbti)} disabled={waiting}>
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
        <ChatRoom ws={ws} onClose={closeChat} selectedMbti={selectedMbti} sendMessage={sendMessage} />
      )}
    </main>
  );
};

export default MainPage;
