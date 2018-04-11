
$('#loginForm').hide();
$('#registerForm').hide();
$('#errMsgUsername').hide();
$('#errMsgPassword').hide();
$('#errMsgEmail').hide();

$('#showLogin').on('click', () => {
  $('#showLogin').addClass('active');
  $('#showRegister').removeClass('active');
  $('#loginForm').show();
  $('#registerForm').hide();
});

$('#showRegister').on('click', () => {
  $('#showLogin').removeClass('active');
  $('#showRegister').addClass('active');
  $('#loginForm').hide();
  $('#registerForm').show();
});

$('#registerForm>button').on('click', () => {
  document.querySelector('#registerForm>button').disabled = true;
  document.querySelector('#registerForm>button').innerHTML = 'please wait ...';
  if ($('#password1').val() != $('#password2').val()) {
    $('#errMsgPassword').show();
    document.querySelector('#registerForm>button').disabled = false;
    document.querySelector('#registerForm>button').innerHTML = 'Create Account';
  } else {
    $('#errMsgPassword').hide();
    var usernameOK = false;
    var emailOK = false;
    $.when(axios({
      method: 'post',
      url: '/register/username',
      data: {
        username: document.querySelector('#username').value
      }
    }).then((res) => {
      console.log('POST /register/username response: ', res.data);
      if (!res.data) { $('#errMsgUsername').show(); }
      else { $('#errMsgUsername').hide(); usernameOK = true; }
    }), axios({
      method: 'post',
      url: '/register/email',
      data: {
        email: document.querySelector('#email').value
      }
    }).then((res) => {
      console.log('POST /register/email response: ', res.data);
      if (!res.data) { $('#errMsgEmail').show(); }
      else { $('#errMsgEmail').hide(); emailOK = true; }
    })).then(() => {
      document.querySelector('#registerForm>button').disabled = false;
      document.querySelector('#registerForm>button').innerHTML = 'Create Account';
      if ( usernameOK && emailOK ) {
        $('#registerForm').submit();
      }
    });
  }
});