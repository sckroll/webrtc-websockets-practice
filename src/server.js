import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';

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


// HTTP & 웹소켓(socket.io) 서버 동시에 돌리기
// 이로써 같은 localhost:3000 주소에서 HTTP와 웹소켓 요청을 동시에 처리 가능 
// (WS만 연결시킬 수 있음, 즉 HTTP는 필수가 아님)
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// public rooms를 반환하는 함수
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    }
  } = wsServer;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  })
  return publicRooms;
}

// 사용자 카운트
function countRoom(roomName) {
  return wsServer.sockets.adapter.room.get(roomName)?.size;
}

// 각 socket은 socket.id로 구분됨
wsServer.on('connection', socket => {
  // 익명의 닉네임으로 초기화
  socket['nickname'] = 'Anonymous';

  // 호출된 이벤트를 콘솔에 출력
  socket.onAny(e => {
    // Adapter 로그 출력
    /*
      Adapter?
      다른 서버들 사이에 실시간 애플리케이션을 동기화
      서버의 메모리에서 Adapter 사용 중
      현재는 서버 종료 시 모든 room, message, socket은 사라짐
      모든 클라이언트에 대해 connection을 연결해야 함 => 실시간으로 서버 메모리에 있어야 함
      => 즉, 항상 오픈 상태를 유지
      서버에 많은 connection이 들어옴
      많은 connection을 메모리에 저장하게 됨 => 서버 여러 개를 사용
      Adapter를 사용하겠다는 의미 = 같은 memory pool을 공유
     */
    console.log(wsServer.sockets.adapter);

    console.log(`Socket event: ${e}`);
  });

  // ws와는 달리 전달 받은 이벤트명을 그대로 수신
  // 두 번째 콜백의 두 번째 파라미터 done은
  // 클라이언트에서 호출할 때 세 번째 인자로 전달한 콜백이며,
  // 서버에서 함수를 호출하지만 브라우저에 결과가 나타남
  // (호출 시 클라이언트로 인자를 전달할 수 있음)
  socket.on('enter_room', (roomName, done) => {
    // console.log(roomName);
    // setTimeout(() => {
    //   done('hello from backend');
    // }, 3000);

    // 해당 Room에 참가
    // 인자로 배열을 전달하면 여러 방에 참가할 수 있음
    socket.join(roomName);
    done();

    // 방 나가기
    // socket.leave(roomName);

    // 특정한 방에 이벤트 보내기
    // to()를 체이닝하거나, 인자로 배열을 보내면 여러 방에 이벤트를 보낼 수 있음
    // 인자에 방 이름 대신 특정 socket.id를 주면 개인에게 이벤트 전달 가능 (ex: 개인 메시지)
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));

    // 연결된 모든 socket에 매시지 전송
    wsServer.sockets.emit('room_change', publicRooms());
  });

  // 접속 중단 시 발생하는 이벤트 (아직 완전히 나가기 전)
  // 완전히 끊어졌을 때의 disconnect와 구별할 것
  socket.on('disconnecting', () => {
    // rooms: 존재하는 모든 방을 담은 Set
    socket.rooms.forEach(room => socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1));
  })
  
  socket.on('disconnect', () => {
    // 연결된 모든 socket에 매시지 전송
    wsServer.sockets.emit('room_change', publicRooms());
  })

  // 메시지 수신
  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    done();
  })

  // 닉네임 변경
  socket.on('nickname', nickname => {
    socket['nickname'] = nickname;
  });

  // 사용자 한 명을 만들어거 강제로 socket이 방에 입장하도록 하는 방법
  // wsServer.socketsJoin('room1');
  // 혹은 특정 방에 있는 모든 socket을 다른 방으로 들어가게 할 수 있음
  // wsServer.in('room1').socketsJoin(['room2', 'room3']);
});

const handleListen = () => console.log('Listening to http://localhost:3000');
httpServer.listen(3000, handleListen);