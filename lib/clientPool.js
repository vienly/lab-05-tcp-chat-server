'use strict';

const EventEmitter = require('events').EventEmitter;

const ClientPool = module.exports = exports = function() {
  this.internalCounter = 0; // only for temporary user nickname, might be useful to keep track of how many registered users there are
  this.pool = {};
  EventEmitter.call(this);

  this.on('register', (socket) => {
    socket.write('connected to server!');
    this.internalCounter++;
    register(socket, this);
  });

  this.on('broadcast', (data) => {
    console.log(data.toString());
    Object.keys(this.pool).forEach(function(clientid) {
      this.pool[clientid].write(data.toString());
    });
  });

};

function register(socket, clientPool) {
  socket.profile = {};
  socket.profile.id = 'user_' + Date.now();
  socket.profile.nickname = 'guest_' + clientPool.internalCounter;

  socket.on('data', function(data) {
    clientPool.emit('broadcast', data);
  });

  socket.on('close', function() {
    console.log(socket.profile.id + ' disconnected');
  });

  socket.on('error', function(err) {
    console.error('error from ' + socket.profile.id + ': ' + err.message);
  });


  clientPool.pool[socket.profile.id] = socket;
}
