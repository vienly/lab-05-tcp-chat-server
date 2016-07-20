'use strict';

const EventEmitter = require('events').EventEmitter;
const chalk = require('chalk');
const FIN = new Buffer([0xff, 0xf4, 0xff, 0xfd, 0x06]);

const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

function register(socket, clientPool) {
  socket.profile = {};
  socket.profile.id = 'user_' + Date.now();
  socket.profile.nickname = 'guest-' + clientPool.internalCounter;
  socket.profile.color = colors[Math.floor(Math.random() * colors.length)];

  console.log(socket.profile.id + ' connected!');

  socket.on('data', (data) => {
    if (data.compare(FIN) === 0) {
      socket.write(formatMessage('serverMessage', 'Goodbye ' + chalk[socket.profile.color](socket.profile.nickname) + '\r\n'));
      socket.end();

    } else if (data.toString().indexOf('\\nick') === 0) {
      clientPool.ee.emit('nickChange', socket, data);
    } else
    clientPool.ee.emit('broadcast', socket, data);
  });

  socket.on('close', () =>  {
    clientPool.ee.emit('disconnect', socket);
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
    console.log('registering new user');
    this.internalCounter++;
    register(socket, this);

    Object.keys(this.pool).forEach(function(clientid) {
      if(socket.profile.id !== clientid)
        // others
        this.pool[clientid].write(formatMessage('serverMessage', chalk[socket.profile.color](socket.profile.nickname) + ' has connected to server\r\n'));
      else
        // self
        socket.write(formatMessage('serverMessage', 'Welcome to the server! ' + chalk[socket.profile.color](socket.profile.nickname) + '\r\n'));
    }.bind(this));

  });

  this.ee.on('broadcast', (socket, data) => {
    let message = formatMessage('userMessage', data.toString(), socket);
    console.log(socket.profile.nickname + ': ' + message);
    Object.keys(this.pool).forEach(function(clientid) {
      this.pool[clientid].write(message);
    }.bind(this));
  });

  this.ee.on('nickChange', (socket, data) => {
    var newNick = data.toString().slice(5).trim();
    let message = formatMessage('serverMessage', chalk[socket.profile.color](socket.profile.nickname) + ' is changing nickname to ' + chalk[socket.profile.color](newNick) + '\r\n');
    console.log(message);
    Object.keys(this.pool).forEach(function(clientid) {
      if(socket.profile.id !== clientid)
        this.pool[clientid].write(message);
    }.bind(this));
    socket.profile.nickname = newNick;
  });

  this.ee.on('disconnect', (socket) => {
    let message = formatMessage('serverMessage', chalk[socket.profile.color](socket.profile.nickname) + ' has disconnected from the server\r\n');
    console.log(message);
    Object.keys(this.pool).forEach(function(clientid) {
      if(socket.profile.id !== clientid)
        this.pool[clientid].write(message);
    }.bind(this));
    delete this.pool[socket.profile.id];
  });
};

function formatMessage(messageType, message, socket) {
  if (messageType === 'userMessage') {
    return `${chalk[socket.profile.color](socket.profile.nickname)}: ${message}`;
  } else if (messageType === 'serverMessage') {
    return `${chalk.white.bgYellow.bold('SERVER:')} ${message}`;
  }
}


// inheritance
// ClientPool.prototype = Object.create(EventEmitter.prototype);
