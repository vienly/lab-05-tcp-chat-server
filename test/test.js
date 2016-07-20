'use strict';
const net = require('net');
const expect = require('chai').expect;

const server = require('../_server');

const port = 3000;

describe('chat server', function() {
  before(function(done) {
    server.listen(port, done);
  });

  after(function(done) {
    server.close(done);
  });

  it('should send some data between clients', function(done) {
    let client1 = net.connect({port});
    let client2 = net.connect({port});

    // var messages = ['something different'];
    // var toSend = ['test message'];

    client2.on('data', (data) => {
      if(data.toString().includes('SERVER:')) {
        expect(data.toString()).to.have.string('Welcome to the server!');
        console.log('writing');
        client1.write('something different');
        // if (messages.length)
        //   client1.write(messages.pop());
      }
    });

    client2.on('close', () => {
      client1.end();
      // done();
    });

    client1.on('data', (data) => {
      if(data.toString().includes('SERVER:')) {
        if(data.toString().includes('Welcome to the server!') || data.toString().includes('connected to server') || data.toString().includes('disconnected from the server')) {
          let tf = true;
          expect(tf).to.eql(true);
          console.log('sadhlasjdhas');

          // client2.end();
          // done();
        }
      } else {
        // console.log('sadhlasjdhas');

        expect(data.toString()).to.have.string('something different');
        client2.end();
        // done();
      }
    });

    client1.on('close', function() {
      // client2.end();
      done();
    });
  });
});
