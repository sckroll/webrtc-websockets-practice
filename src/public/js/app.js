const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

// room 요소 숨기기
room.hidden = true;

let roomName = '';

// 메시지를 화면에 표시
function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');

  li.innetText = message;
  ul.appendChild(li);
}

// 메시지 보내기
function handleMessageSubmit(e) {
  e.preventDefault();

  const input = room.querySelector('#msg input');
  const value = input.value;

  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = '';
}

// 닉네임 변경
function handleNicknameSubmit(e) {
  e.preventDefault();

  const input = room.querySelector('#name input');
  const value = input.value;

  socket.emit('nickname', input.value);
  input.value = '';
}

// 닉네임 입력 폼과 채팅 촘 전환
function showRoom() {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;

  const msgForm = room.querySelector('#msg');
  const nameForm = room.querySelector('#name');
  msgForm.addEventListener('submit', handleMessageSubmit);
  nameForm.addEventListener('submit', handleNicknameSubmit);
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const input = form.querySelector('input');
  // ws는 send()로 보내야 하며, 전달하는 값은 무조건 문자열이지만,
  // SocketIO는 emit()으로 이름 상관 없는 커스텀 이벤트를 호출하며, 객체 전달 가능
  // 마지막 인자로 콜백을 전달할 수 있는데, 이는 서버에서 호출하는 함수임
  // (서버로 전달할 값은 여러 개 넣을 수 있지만, 콜백은 무조건 마지막에 넣어야 함)
  // 콜백의 파라미터로 서버에서 받은 값을 사용 가능함
  // socket.emit('enter_room', { payload: input.value }, msg => {
  //   console.log(`server says: ${msg}`);
  // });

  socket.emit('enter_room', input.value, showRoom);
  roomName = input.value;
  input.valut = '';
})

socket.on('welcome', (user, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;

  addMessage(`${user} joined!`);
});

socket.on('bye', (left, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;

  addMessage(`${left} left ㅜㅜ!`);
});

// socket.on('new_message', msg => addMessage(msg));
socket.on('new_message', addMessage);

// 방 개수 업데이터
socket.on('room_change', rooms => {
  const roomList = welcome.querySelector('ul');
  roomList.innerHTML = '';
  if (room.length === 0) return;

  rooms.forEach(room => {
    const li = document.createElement('li');
    li.innerText = room;
    roomList.append(li);
  });
});