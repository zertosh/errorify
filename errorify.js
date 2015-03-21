'use strict';

var through = require('through2');

// https://github.com/sindresorhus/ansi-regex/blob/47fb974/index.js
var ansiRegex = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/g;

function replace(err) {
  var message = String(err).replace(ansiRegex, '');
  return '(typeof alert=="function"?alert:console.error)(' + JSON.stringify(message) + ');';
}

module.exports = function errorify(b, opts) {
  var bundle = b.bundle.bind(b);
  b.bundle = function(cb) {
    var output = through();
    var pipeline = bundle(cb);
    pipeline.on('error', function(err) {
      console.error('errorify: %s', err);
      output.push(replace(err));
      output.push(null);
      pipeline.unpipe(output);
    });
    pipeline.pipe(output);
    return output;
  };
};
