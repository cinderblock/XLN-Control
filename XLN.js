'use strict';

const XLN_UDP_PORT = 9221;

class XLN {
  contructor(options, callback) {

    this.host = options.host;
    this.sock = dgram.createSocket('udp4');

    this.sock.bind(options.bindOptions || {}, callback);

    // 96 bytes per message
    this.buff = new Buffer(96);
  }

  send(str, callback) {
    this.sock.once('message', msg => callback(parseMessage(msg)));
    this.buff.fill(0);
    this.buff.write(str);
    this.sock.send(this.buff, 0, this.buff.length, XLN_UDP_PORT, this.host);
  }

  parseMessage(msg) {
    return msg.toString();
  }
}

module.exports = XLN;
