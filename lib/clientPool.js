'use strict';

const EventEmitter = require('events').EventEmitter;

function register(socket, clientPool) {
  socket.profile = {};
  socket.profile.id = 'user_' + Date.now();
  socket.profile.nickname = 'guest-' + clientPool.internalCounter;

  console.log(socket.profile.id + ' connected!');

  socket.on('data', function(data) {
    if(data.toString().indexOf('\\nick') === 0) {
      clientPool.ee.emit('nickChange', socket, data);
    } else
    clientPool.ee.emit('broadcast', socket, data);
  });

  socket.on('close', function() {
    console.log(socket.profile.id + ' disconnected');
  });

  socket.on('error', function(err) {
    console.error('error from ' + socket.profile.id + ': ' + err.message);
  });

  clientPool.pool[socket.profile.id] = socket;
}

const ClientPool = module.exports = function() {
  this.ee = new EventEmitter();

  this.internalCounter = 0; // only for temporary user nickname, might be useful to keep track of how many registered users there are
  this.pool = {};

  this.ee.on('register', (socket) => {
    socket.write('connected to server!\n');
    this.internalCounter++;
    register(socket, this);
  });

  this.ee.on('broadcast', (socket, data) => {
    console.log(socket.profile.nickname + ': ' + data.toString());
    Object.keys(this.pool).forEach(function(clientid) {
      if(socket.profile.id !== clientid)
        this.pool[clientid].write(socket.profile.nickname + ': ' + data.toString());
    }.bind(this));
  });

  this.ee.on('nickChange', (socket, data) => {
    var newNick = data.toString().slice(5).trim();
    console.log(socket.profile.nickname + ' is changing nickname to ' + newNick);
    Object.keys(this.pool).forEach(function(clientid) {
      this.pool[clientid].write(socket.profile.nickname + ' is changing nickname to ' + newNick + '\r\n');
    }.bind(this));
    socket.profile.nickname = newNick;
  });
};

// inheritance
// ClientPool.prototype = Object.create(EventEmitter.prototype);
