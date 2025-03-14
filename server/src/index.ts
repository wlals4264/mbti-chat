import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 5001 });

wss.on('connection', (ws: WebSocket) => {
  console.log('✅ 클라이언트가 연결됨');

  ws.on('message', (message) => {
    console.log(`📩 받은 메시지: ${message}`);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('❌ 클라이언트 연결 종료');
  });
});

console.log('🚀 WebSocket 서버가 5001번 포트에서 실행 중...');
