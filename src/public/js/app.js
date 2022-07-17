// DOM 요소 받기
const msgList = document.querySelector('ul');
const nickForm = document.querySelector('#nick');
const msgForm = document.querySelector('#message');

// 메시지 타입과 값을 객체로 만들고 문자열로 만드는 함수
const makeMessage = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// 웹소켓 연결
// 클라이언트에서의 socket은 서버로의 연결을 의미
const socket = new WebSocket(`ws://${window.location.host}`);

// socket이 열렸을 때 발생하는 이벤트
socket.addEventListener('open', () => {
  console.log('Connected to Server');
});

// 서버로부터 메시지를 받았을 때 발생하는 이벤트
socket.addEventListener('message', message => {
  // 메시지를 화면에 렌더링
  const li = document.createElement('li');
  li.innerText = message.data;
  msgList.append(li);
});

// socket 연결이 끊겼을 때 발생하는 이벤트
socket.addEventListener('close', () => {
  console.log('Disconnected from Server');
});

// 일정 시간 후 메시지 보내기
// setTimeout(() => {
//   socket.send('hello from the browser');
// }, 3000);

// 메시지 form 이벤트 처리 & 서버로 메시지 보내기
msgForm.addEventListener('submit', e => {
  e.preventDefault();

  const input = msgForm.querySelector('input');
  socket.send(makeMessage('new_message', input.value));
  input.value = '';
})

// 닉네임 form 이벤트 처리
nickForm.addEventListener('submit', e => {
  e.preventDefault();

  const input = nickForm.querySelector('input');
  socket.send(makeMessage('nickname', input.value));
});