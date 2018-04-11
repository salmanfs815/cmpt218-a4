const http = require('http');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const path = require('path');
const passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;

const result = require('dotenv').config();
if (result.error) {
  throw result.error;
}

var app = express();
var port = process.env.PORT || 8000;

var server = http.createServer(app).listen(port, 
  () => console.log(`Server is listening on port ${port}`));
var io = require('socket.io')(server);

mongoose.connect(process.env.DB_URL, (err) => {
  if (err) throw err;
  console.log('Successfully connected to MongoDB.');
});

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  user: {type: String, unique: true, required: true},
  pass: {type: String, required: true},
  fname: String,
  lname: String,
  email: {type: String, unique: true, required: true},
  age: Number,
  gender: String,
  wins: {type: Number, default: 0},
  losses: {type: Number, default: 0}
});
UserSchema.methods.verifyPassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.pass);
};
var User = mongoose.model('user', UserSchema);

var GameSchema = new Schema({
  player1: String,
  player2: String,
  winner: {type: String, default: null},
  start: {type: Date, default: Date.now},
  end: {type: Date, default: null},
  numMoves: {type: Number, default: 0}
});
var Game = mongoose.model('game', GameSchema);

app.use('/', (req, res, next) => {
  console.log(req.method, 'request:', req.url);
  next();
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(session({
  secret: 'cmpt218 a4',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({user: username}, (err, usr) => {
    if (err) { return done(err); }
    if (!usr) {
      return done(null, false, {message: 'Incorrect username.'});
    }
    if (!usr.verifyPassword(password)) {
      return done(null, false, {message: 'Incorrect password.'});
    }
    return done(null, usr);
  });
}));

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'favicon.ico'));
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard.html',
  failureRedirect: '/'
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.post('/register/username', (req, res) => {
  User.findOne({user: req.body.username}, (err, usr) => {
    if (err) { 
      console.log(err);
    } else if (usr) {
      //username in use already
      res.send(false);
    } else {
      // username ok to use
      res.send(true);
    }
  });
});

app.post('/register/email', (req, res) => {
  User.findOne({email: req.body.email}, (err, usr) => {
    if (err) { 
      console.log(err);
    } else if (usr) {
      // email in use already
      res.send(false);
    } else {
      // email ok to use
      res.send(true);
    }
  });
});

app.post('/register', (req, res) => {
  console.log(req.body);
  var newUser = new User({
    user: req.body.username,
    pass: bcrypt.hashSync(req.body.password),
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    age: req.body.age,
    gender: req.body.gender
  });
  newUser.save((err) => {
    if (err) {
      console.log(err);
      res.sendStatus(503);
    } else {
      console.log('created new user: ', req.body.username);
      res.sendFile(path.join(__dirname, 'public', 'register.html'));
    }
  });
});

app.get('/user', (req, res) => {
  if (req.user) { res.send(req.user); }
  else { res.redirect(401, '/'); }
});

app.get('/prev-games', (req, res) => {
  if (req.user) {
    Game.find({
      $or: [
        { 'player1': req.user.user },
        { 'player2': req.user.user },
      ]
    }, (err, docs) => {
      if (err) { console.log(err); }
      else { res.json(docs); console.log(docs); }
    });
  } else { res.redirect(401, '/'); }
})

app.post('/play', (req, res) => {
  if (req.user) {
    res.send(req.user);
  } else { res.redirect(401, '/'); }
});


var clients = 0;
io.on('connection', function(socket){
  console.log('new connection');
  clients++;
  socket.emit('clientChange',clients);
  socket.broadcast.emit('clientChange',clients);

  socket.on('chat', function(message){
    socket.broadcast.emit('message',message);
  });

  socket.on('move', function(mv){
    socket.broadcast.emit('move',mv);
  })

  socket.on('disconnect', function(){
    console.log('Disconnect event');
    clients--;
    //socket.emit('clientChange',clients);
    socket.broadcast.emit('clientChange',clients);
  });

  socket.emit("message", "You're connected!!!");
});
