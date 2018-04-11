const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const result = require('dotenv').config();
if (result.error) {
  throw result.error;
}
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
  pass: bcrypt.hashSync('namlas'),
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

/*var game = new Game({
  player1: 'salman',
  player2: 'user2',
});
game.save((err)=>{
  if (err) console.log(err);
  else console.log('successfully created new game');
});

game.winner = 'player2';
game.end = Date.now();
game.numMoves = 15;
game.save((err)=>{
  if (err) console.log(err);
  else console.log('successfully saved updates to game');
});*/

