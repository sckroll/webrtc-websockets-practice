const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

// room 요소 숨기기
room.hidden = true;

let roomName = '';

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
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