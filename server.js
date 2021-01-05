var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var players = {};

app.use(express.static(__dirname + '/dist'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('kill', socket.id);
  });

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].volumes = movementData.volumes;
    players[socket.id].size = movementData.size;
    players[socket.id].speaking = movementData.speaking;
    players[socket.id].puppet = movementData.puppet;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });


});

server.listen(process.env.PORT || 8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
