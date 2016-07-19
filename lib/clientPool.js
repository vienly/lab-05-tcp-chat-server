'use strict';

const EventEmitter = require('events').EventEmitter;
const chalk = require('chalk');

const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

function register(socket, clientPool) {
  socket.profile = {};
  socket.profile.id = 'user_' + Date.now();
  socket.profile.nickname = 'guest-' + clientPool.internalCounter;
  socket.profile.color = colors[Math.floor(Math.random() * colors.length)];

  console.log(socket.profile.id + ' connected!');

  socket.on('data', (data) => {
    if(data.toString().indexOf('\\nick') === 0) {
      clientPool.ee.emit('nickChange', socket, data);
    } else
    clientPool.ee.emit('broadcast', socket, data);
  });

  socket.on('close', () =>  {
    console.log(socket.profile.id + ' disconnected');
  });

  socket.on('error', (err) => {
    console.error('error from ' + socket.profile.id + ': ' + err.message);
  });

  clientPool.pool[socket.profile.id] = socket;
}

const ClientPool = module.exports = function() {
  this.ee = new EventEmitter();

  this.internalCounter = 0; // only for temporary user nickname, might be useful to keep track of how many registered users there are
  this.pool = {};

  this.ee.on('register', (socket) => {
    // socket.write(formatMessage('serverMessage', 'connected to server!\n'));

    this.internalCounter++;
    register(socket, this);

    Object.keys(this.pool).forEach(function(clientid) {
      if(socket.profile.id !== clientid)
        this.pool[clientid].write(formatMessage('serverMessage', socket.profile.nickname + ' connected to server\n'));
      else
        socket.write(formatMessage('serverMessage', 'Welcome to the server! ' + socket.profile.nickname + '\r\n'));
    }.bind(this));

  });

  this.ee.on('broadcast', (socket, data) => {
    console.log(socket.profile.nickname + ': ' + data.toString());
    Object.keys(this.pool).forEach(function(clientid) {
      if(socket.profile.id !== clientid)
        this.pool[clientid].write(formatMessage('userMessage', data, socket));
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

function formatMessage(messageType, data, socket) {
  if(messageType === 'userMessage') {
    return `${chalk[socket.profile.color](socket.profile.nickname)}: ${data.toString()}`;
  } else if (messageType === 'serverMessage') {
    return `${chalk.white.bold('SERVER: ')} ${data.toString()}`;
  }
}

// inheritance
// ClientPool.prototype = Object.create(EventEmitter.prototype);
