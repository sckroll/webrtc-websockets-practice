import express from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();

// 뷰 엔진을 Pug로 설정 & 뷰 파일이 위치한 디렉토리를 설정
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// static 디렉토리 설정
app.use('/public', express.static(__dirname + '/public'));

// 라우트 설정 (home.pug 렌더링 수행)
app.get('/', (req, res) => res.render('home'));

// 다른 라우트를 입력했을 경우 루트 경로로 리다이렉트
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log('Listening to http://localhost:3000');

// 3000 포트로 서버 실행
// app.listen(3000, handleListen);

// HTTP & 웹소켓(ws) 서버 동시에 돌리기
// 이로써 같은 localhost:3000 주소에서 HTTP와 웹소켓 요청을 동시에 처리 가능 
// (WS만 연결시킬 수 있음, 즉 HTTP는 필수가 아님)
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 임시 데이터베이스
const sockets = [];

// connection: 연결되었을 때 발생하는 이벤트
// 서버에서의 socket은 연결된 브라우저를 의미
wss.on('connection', socket => {
  // 임시 DB에 socket 추가
  sockets.push(socket);

  // 익명의 경우 socket 닉네임 속성을 Ananymous로 설정
  socket['nickname'] = 'Anonymous';

  // 브라우저와 연결이 끊겼을 때 발생하는 이벤트
  socket.on('close', () => {
    console.log('Disconnected from Browser');
  })

  // 브라우저로부터 메시지를 받았을 경우 발생하는 이벤트
  socket.on('message', msg => {
    // 받은 메시지를 객체로 변환
    const message = JSON.parse(msg);

    switch (message.type) {
      case 'new_message':
        // 연결된 각 브라우저에 메시지 보내기
        sockets.forEach(aSocket => {
          aSocket.send(`${socket.nickname}: ${message.payload}`);
        });
        break;
      case 'nickname':
        socket['nickname'] = message.payload;
        break;
    }

  });

  console.log('Connected to Browser');
  socket.send('hello!');
});

server.listen(3000, handleListen);