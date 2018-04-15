var prevGames = [];

axios({
  method: 'get',
  url: '/user',
}).then((res) => {
  $('#user').text(res.data.user);
  $('#wins').text(res.data.wins);
  $('#losses').text(res.data.losses);
  $('#name').text(res.data.fname + ' ' + res.data.lname);
  $('#email').text(res.data.email);
  $('#age').text(res.data.age);
  $('#gender').text(res.data.gender);
}).catch((err) => {
  if (err.response.status === 401) {
    alert('Please log in to continue.');
    // redirect to login ('/')
    $(location).attr('href', '/');
  } else {
    console.log(err);
  }
});

axios({
  method: 'get',
  url: '/prev-games'
}).then((res) => {
  prevGames = res.data;
  var timeOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  res.data.forEach((game) => {
    var d_start = new Date(game.start);
    var d_end = new Date(game.end);
    $('#prevGames').append(`
    <tr>
      <td>${game.player1}</td>
      <td>${game.player2}</td>
      <td>${game.winner}</td>
      <td>${game.numMoves}</td>
      <td>${d_start.toLocaleString('en-CA', timeOptions)}</td>
      <td>${d_end.toLocaleString('en-CA', timeOptions)}</td>
    </tr>`);
  });
}).catch((err) => {
  if (err.response.status != 401)
    console.log(err);
});