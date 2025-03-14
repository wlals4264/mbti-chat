import { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5001');

    socket.onmessage = (event) => {
      setResponse(event.data);
    };

    // socket.onclose = () => {
    //   console.log('서버 연결 종료');
    // };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      console.log('WebSocket 연결이 열리지 않았습니다.');
      alert('서버와의 연결이 열리지 않았습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <div className="App">
      <h1>MBTI 랜덤 채팅</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요"
      />
      <button onClick={sendMessage}>메시지 전송</button>
      <p>✉️ {response}</p>
    </div>
  );
}

export default App;
