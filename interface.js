'use strict';

var XLN = require('./XLN.js');


var x = new XLN({host: '192.168.1.166'}, function() {
  console.log('done');
});

setInterval(function () {
  x.readStatus(function(msg) {
    console.log(msg);
  });
}, 1000);
