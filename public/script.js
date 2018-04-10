
var username = prompt("Please enter your name", "unknown");
var numMoves = 0;

function printMessage(message) {
  var p = document.createElement("p");
  p.innerText = message;
  document.querySelector("div.messages").appendChild(p);
}

function makeMove(move){
  /*
    move (integer):  index of cell to make move
  */
  if (numMoves >= 0){
    $('td')[move].innerHTML = numMoves%2===0?'X':'O';
    numMoves++;
    var game = gameState();
    if (game != '-'){
      var msg = "!!!";
      if (game === 'D') {msg = 'Draw!';}
      else if (game === 'X') {msg = 'X Won!';}
      else if (game === 'O') {msg = 'O Won!';}
      $('#gameOver').text(msg);
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
      return $('td')[9*0+3*j+0].innerHTML;
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
    if (cell.innerHTML === ' '){
      makeMove(cell.index)
      socket.emit('move',cell.index);
    }
  });
});

var socket = io("http://localhost:8000");

socket.on('connect', function(){
  var msg = username + " has connected!!";
  socket.emit('chat',msg);
});

socket.on('clientChange', function(clientNum){
  document.querySelector("#number").innerHTML = clientNum + " clients connected";
});

socket.on('message',function(message){
  printMessage(message);
});

socket.on('move', (mvstr) => {
  makeMove(Number(mvstr));
});

document.getElementById('discon').onclick = function(){
  socket.emit('chat', `${username} has diconnected`);
  printMessage("You have diconnected");
  socket.close();
  // re-direct
}

document.forms[0].onsubmit = function () {
  var input = document.getElementById("message");
  var msg = username + ": " + input.value
  printMessage(msg);
  socket.emit('chat',msg);
  input.value = '';
};

