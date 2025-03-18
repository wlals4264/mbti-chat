import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
}

// 5001번 포트에서 웹소켓 서버 실행
const wss = new WebSocketServer({ port: 5001 });

// 매칭을 기다리는 사용자(클라이언트)들을 저장하는 대기열 배열
const waitingUsers: ExtendedWebSocket[] = [];

// 현재 활성화된 채팅 방을 저장하는 Map 객체
// 키는 roomId이며, 값은 두 개의 WebSocket 객체(1:1 매칭)
const rooms = new Map<string, [ExtendedWebSocket, ExtendedWebSocket]>();

// 새로운 클라이언트가 연결될 때 실행되는 이벤트 핸들러
wss.on('connection', (ws: ExtendedWebSocket) => {
  console.log('✅ 클라이언트가 연결됨');

  // 클라이언트가 메시지를 보낼 때 실행되는 이벤트 핸들러
  ws.on('message', (message: string) => {
    const data = JSON.parse(message);

    // 사용자가 "join" 요청을 보낸 경우 (매칭 요청)
    if (data.type === 'join') {
      // 대기 중인 사용자가 있을 경우 즉시 매칭
      if (waitingUsers.length > 0) {
        const pair = waitingUsers.shift()!;
        const roomId = uuidv4();

        rooms.set(roomId, [ws, pair]);

        ws.roomId = roomId;
        pair.roomId = roomId;

        ws.send(JSON.stringify({ type: 'matched', roomId }));
        pair.send(JSON.stringify({ type: 'matched', roomId }));

        // 1시간 후 자동으로 방 삭제
        setTimeout(() => {
          if (rooms.has(roomId)) {
            rooms.get(roomId)?.forEach((client) => client.close());
            rooms.delete(roomId);
          }
        }, 60 * 60 * 1000);
      } else {
        // 매칭 대기 상태인 경우 대기열에 추가
        waitingUsers.push(ws);
        ws.send(JSON.stringify({ type: 'waiting' }));
      }

      // 사용자가 "message" 요청을 보낸 경우 (채팅 메시지 전송)
    } else if (data.type === 'message') {
      const room = rooms.get(ws.roomId!);
      if (room) {
        room.forEach((client) => {
          const messageToSend = {
            type: 'message',
            text: data.text,
            mbti: data.mbti,
            isOwnMessage: client === ws,
          };
          client.send(JSON.stringify(messageToSend));
        });
      }
    }
  });

  // 클라이언트가 연결을 종료할 때 실행되는 이벤트 핸들러
  ws.on('close', () => {
    console.log(`❌ 클라이언트 연결 종료 (roomId: ${ws.roomId})`);

    // 사용자가 방에 속해 있는 경우
    if (ws.roomId) {
      const room = rooms.get(ws.roomId);
      if (room) {
        room.forEach((client) => {
          if (client !== ws) {
            client.send(JSON.stringify({ type: 'exit' }));
            client.close();
          }
        });
        rooms.delete(ws.roomId);
      }
    } else {
      // 매칭 대기열에 있던 사용자가 종료한 경우 대기열에서 제거
      const index = waitingUsers.indexOf(ws);
      if (index !== -1) {
        waitingUsers.splice(index, 1);
      }
    }
  });

  // 에러 발생 시 실행되는 이벤트 핸들러
  ws.on('error', (error) => {
    console.error(error);
  });
});

console.log('🚀 WebSocket 서버가 5001번 포트에서 실행 중...');
