const http = require('http');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const path = require('path');

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

const SALT_WORK_FACTOR = 10;

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  user: {type: String, unique: true, required: true},
  pass: {type: String, required: true},
  fname: String,
  lname: String,
  email: {type: String, unique: true, required: true},
  age: Number,
  gender: String
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


/*var salman = new User({
  user: 'salman',
  pass: bcrypt.hashSync('namlas', SALT_WORK_FACTOR),
  fname: 'Salman',
  lname: 'Siddiqui',
  email: 'salmans@sfu.ca',
  age: '20',
  gender: 'male'
});
salman.save((err)=>{
  if (err) console.log(err);
  else console.log('successfully created new user account');
});*/

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

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'favicon.ico'));
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
