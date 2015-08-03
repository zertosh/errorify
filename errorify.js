'use strict';

var stream = require('stream');

// https://github.com/sindresorhus/ansi-regex/blob/47fb974/index.js
var ansiRegex = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/g;

function template(error) {
  /*eslint-env browser*/
  console.error(error);
  if (typeof document === 'undefined') return;
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', print);
  } else {
    print();
  }
  function print() {
    var pre = document.createElement('pre');
    pre.className = 'errorify';
    pre.textContent = error.message || error;
    if (document.body.firstChild) {
      document.body.insertBefore(pre, document.body.firstChild);
    } else {
      document.body.appendChild(pre);
    }
  }
}

function replace(err) {
  var message;
  if (err.codeFrame) { //babelify@6.x
    message = [err.message, err.codeFrame].join('\n\n');
  } else { //babelify@5.x and browserify
    message = err.annotated || err.message;
  }

  //normalize error properties
  err = {
    message: message,
    lineNumber: typeof err.line === 'number' ? err.line : err.lineNumber,
    columnNumber: typeof err.column === 'number' ? err.column : err.columnNumber,
    name: err.name,
    stack: err.stack,
    fileName: err.fileName
  };

  var result = {};
  Object.keys(err).forEach(function(key) {
    var val = err[key];
    if (typeof val !== 'undefined') {
      result[key] = typeof val === 'number'
            ? val
            : String(val).replace(ansiRegex, '');
    }
  });

  return '!' + template + '(' + JSON.stringify(result) + ')';
}

module.exports = function errorify(b, opts) {
  var bundle = b.bundle;
  b.bundle = function(cb) {
    var output = new stream.Transform();
    output._transform = function(chunk, enc, callback) {
      callback(null, chunk);
    };
    var pipeline = bundle.call(b, cb);
    pipeline.on('error', function(err) {
      // module-deps likes to emit each error
      console.error('errorify: %s', err);
    });
    pipeline.once('error', function(err) {
      output.push(replace(err));
      output.push(null);
      pipeline.unpipe(output);
    });
    pipeline.pipe(output);
    return output;
  };
};
