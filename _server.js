'use strict';

const net = require('net');
const ClientPool = require(__dirname + '/lib/ClientPool');

const testPool = new ClientPool();

var port = 3000;

var server = module.exports = net.createServer((socket) => {
  testPool.ee.emit('register', socket);
});
