import { useState } from 'react';
import { mbti } from '../data/mbti';
import ChatRoom from '../components/ChatRoom';
import Spinner from '../components/Spinner';
import useWebSocketController from '../hooks/useWebSocketController';
import useSendMessage from '../hooks/useSendMessage';
import { useCloseChat } from '../hooks/useCloseChat';
import { useValidateMbti } from '../hooks/useValidateMbti';

const MainPage: React.FC = () => {
  const { ws, roomId, waiting, chatOpen, connectWebSocket } = useWebSocketController();
  const closeChat = useCloseChat(ws, roomId);
  const sendMessage = useSendMessage(ws, roomId);
  const validateMbti = useValidateMbti();
  const [selectedMbti, setSelectedMbti] = useState<string>('');

  const handleConnect = () => {
    if (validateMbti(selectedMbti)) {
      connectWebSocket();
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
          <button type="button" onClick={handleConnect} disabled={waiting}>
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
