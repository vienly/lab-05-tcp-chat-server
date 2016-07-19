'use strict';

const net = require('net');
const ClientPool = require(__dirname + '/lib/ClientPool');

const testPool = new ClientPool();
const server = net.createServer();

var port = 3000;

server.on('connection', (socket) => {
  testPool.ee.emit('register', socket);
});

server.listen(port, () => {
  console.log('server running on port ' + port);
});
