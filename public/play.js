var socket = io("http://localhost:8000");

var username = '';
var opponent = ''
var numMoves = -1; // nonnegative when game is in progress
var playerNum = -1; // 0 or 1
var roomId = ''; // name of game room
var gameStartTime = 0;

function printMessage(message) {
  var p = document.createElement("p");
  p.innerText = message;
  var elem = document.querySelector("div.messages");
  elem.appendChild(p);
  elem.scrollTop = elem.scrollHeight;
}

function makeMove(move){
  /*
    move (integer):  index of cell to make move
  */
  if (numMoves >= 0) {
    $('td')[move].innerHTML = numMoves%2===0?'X':'O';
    numMoves++;
    var game = gameState();
    if (game != '-'){
      var msg = "!!!";
      if (game === 'D') {msg = 'Draw!';}
      else if (game === 'X') {msg = 'X Won!';}
      else if (game === 'O') {msg = 'O Won!';}
      $('#gameOver').text(msg);
      if (playerNum === 1) {
        socket.emit('gameOver', {
          room: roomId,
          state: game,
          player1: opponent,
          player2: username,
          moves: numMoves,
          start: gameStartTime,
          end: Date.now()
        });
      }
      numMoves = -1;
    }
  }
}

function gameState(){
  /* 
    return game status
    - 'X': player 1 won
    - 'O': player 2 won
    - 'D': draw
    - '-': in progress
  */
  var i=0, j=0, k=0;
  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if ($('td')[9*i+3*j+0].innerHTML != ' '
        && $('td')[9*i+3*j+0].innerHTML===$('td')[9*i+3*j+1].innerHTML
        && $('td')[9*i+3*j+1].innerHTML===$('td')[9*i+3*j+2].innerHTML){
        console.log('i,j',i,j);
        return $('td')[9*i+3*j+0].innerHTML;
      }
    }
    for(k=0; k<3; k++){
      if ($('td')[9*i+3*0+k].innerHTML != ' '
        && $('td')[9*i+3*0+k].innerHTML===$('td')[9*i+3*1+k].innerHTML
        && $('td')[9*i+3*1+k].innerHTML===$('td')[9*i+3*2+k].innerHTML){
        console.log('i,k',i,k);
        return $('td')[9*i+3*0+k].innerHTML;
      }
    }
    if ($('td')[9*i+3*0+0].innerHTML != ' '
      && $('td')[9*i+3*0+0].innerHTML === $('td')[9*i+3*1+1].innerHTML
      && $('td')[9*i+3*1+1].innerHTML === $('td')[9*i+3*2+2].innerHTML){
      console.log('i,j,k',i,0,0);
      return $('td')[9*i+3*0+0].innerHTML;
    }
    if ($('td')[9*i+3*0+2].innerHTML != ' '
      && $('td')[9*i+3*0+2].innerHTML === $('td')[9*i+3*1+1].innerHTML
      && $('td')[9*i+3*1+1].innerHTML === $('td')[9*i+3*2+0].innerHTML){
      console.log('i,j,k',i,0,2);
      return $('td')[9*i+3*0+2].innerHTML;
    }
  }
  for(j=0; j<3; j++){
    for(k=0; k<3; k++){
      if ($('td')[9*0+3*j+k].innerHTML != ' '
        && $('td')[9*0+3*j+k].innerHTML === $('td')[9*1+3*j+k].innerHTML
        && $('td')[9*1+3*j+k].innerHTML === $('td')[9*2+3*j+k].innerHTML){
        console.log('j,k',j,k);
        return $('td')[9*0+3*j+k].innerHTML;
      }
    }
    if ($('td')[9*0+3*j+0].innerHTML != ' '
      && $('td')[9*0+3*j+0].innerHTML === $('td')[9*1+3*j+1].innerHTML
      && $('td')[9*1+3*j+1].innerHTML === $('td')[9*2+3*j+2].innerHTML){
      console.log('i,j,k',0,j,0);
      return $('td')[9*0+3*j+0].innerHTML;
    }
    if ($('td')[9*0+3*j+2].innerHTML != ' '
      && $('td')[9*0+3*j+2].innerHTML === $('td')[9*1+3*j+1].innerHTML
      && $('td')[9*1+3*j+1].innerHTML === $('td')[9*2+3*j+0].innerHTML){
      console.log('i,j,k',0,j,2);
      return $('td')[9*0+3*j+2].innerHTML;
    }
  }
  for(k=0; k<3; k++){
    if ($('td')[9*0+3*0+k].innerHTML != ' '
      && $('td')[9*0+3*0+k].innerHTML === $('td')[9*1+3*1+k].innerHTML
      && $('td')[9*1+3*1+k].innerHTML === $('td')[9*2+3*2+k].innerHTML){
      console.log('i,j,k',0,0,k);
      return $('td')[9*0+3*0+k].innerHTML;
    }
    if ($('td')[9*0+3*2+k].innerHTML != ' '
      && $('td')[9*0+3*2+k].innerHTML === $('td')[9*1+3*1+k].innerHTML
      && $('td')[9*1+3*1+k].innerHTML === $('td')[9*2+3*0+k].innerHTML){
      console.log('i,j,k',0,2,k);
      return $('td')[9*0+3*2+k].innerHTML;
    }
  }
  if (numMoves >= 3*3*3) return 'D';
  return '-'
}

document.querySelectorAll('td').forEach((cell, idx) => {
  cell.index = idx;
  cell.addEventListener('click', () => {
    if (numMoves < 0) {
      alert('The game has not yet begun.');
    } else if (numMoves % 2 != playerNum) {
      alert('Please wait for your opponent to make a move');
    } else if (cell.innerHTML !== ' ') {
      alert('This cell is not empty. Please select a different cell.');
    } else {
      makeMove(cell.index)
      socket.emit('move', {
        room: roomId,
        move: cell.index
      });
    }
  });
});


axios({
  method: 'post',
  url: '/play'
}).then((res) => {
  username = res.data.user;
  // numMoves = 0;
}).catch((err) => {
  if (err.response.status === 401) {
    alert('Please log in to continue.');
    // redirect to login ('/')
    $(location).attr('href', '/');
  } else {
    console.log(err);
  }
});


socket.on('connect', () => {
  socket.emit('play');
});

socket.on('newGame', (room) => {
  roomId = room;
  playerNum = 0;
  console.log(`connected to room ${roomId} as player ${playerNum}`);
});

socket.on('joinGame', (room) => {
  roomId = room;
  playerNum = 1;
  console.log(`connected to room ${roomId} as player ${playerNum}`);
  socket.emit('greet', {
    room: roomId,
    user: username
  });
});

socket.on('greet', (user) => {
  numMoves = 0;
  opponent = user;
  gameStartTime = Date.now();
  socket.emit('greetReply', {
    room: roomId,
    user: username
  });
});

socket.on('greetReply', (user) => {
  numMoves = 0;
  opponent = user;
  gameStartTime = Date.now();
})

socket.on('move', (move) => {
  makeMove(move);
});

socket.on('chat', (msg) => {
  printMessage('opponent' + ': ' + msg);
});

socket.on('gameOver', (game) => {
  var msg = "!!!";
  if (game === 'D') {msg = 'Draw!';}
  else if (game === 'X') {msg = 'X Won!';}
  else if (game === 'O') {msg = 'O Won!';}
  $('#gameOver').text(msg);
  numMoves = -1;
});

document.forms[0].onsubmit = function () {
  var input = document.getElementById('message');
  var msg = input.value;
  printMessage('me' + ': ' + msg);
  socket.emit('chat', {
    room: roomId,
    chat: msg
  });
  input.value = '';
};
