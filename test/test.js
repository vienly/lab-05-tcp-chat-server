'use strict';
const net = require('net');
const expect = require('chai').expect;

const server = require('../_server');

describe('chat server', () => {
  beforeEach(function(done) {
    this.port = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
    server.listen(this.port, done);
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('Should send a welcome message to client', (done) => {
    var client1 = net.connect(this.port);
    client1.on('data', (data) => {
      expect(data.toString().to.have.string('Welcome to the server!'));
    });
    client1.destroy();
    done();
  });

  it('It should broadcast to all users', function (done) {
    const client1 = net.connect(this.port);
    const client2 = net.connect(this.port);

    const toSend = ['test message'];

    client2.on('data', (data) => {
      if(data.toString().includes('Welcome')) {
        expect(data.toString()).to.have.string('Welcome to the server!');
      } else if(data.toString().includes('disconnected')){
        expect(data.toString()).to.have.string('has disconnected from the server');
      } else if(data.toString().includes('connected')) {
        expect(data.toString()).to.have.string('has connected to server');
      }
      if (toSend.length) {
        client1.write(toSend.pop());
      } else {
        client1.end();
      }
    });

    client1.on('close', () => {
      client2.end();
      expect(toSend.length).to.eql(0);
      done();
    });
  });

});
