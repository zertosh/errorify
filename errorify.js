'use strict';

var through = require('through2');

// https://github.com/sindresorhus/ansi-regex/blob/47fb974/index.js
var ansiRegex = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/g;

var errorProps = [
  'stack', 
  'annotated', 
  'name', 
  'message', 
  'fileName', 
  'lineNumber', 'line',
  'columnNumber', 'column'
];

function template(error) {
  /*eslint-env browser*/
  console.error(error.name, error);
  if (typeof document === 'undefined') return;
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', print);
  } else {
    print();
  }
  function print() {
    var pre = document.createElement('pre');
    pre.className = 'errorify';
    pre.textContent = error.annotated || error.message || error;
    if (document.body.firstChild) {
      document.body.insertBefore(pre, document.body.firstChild);
    } else {
      document.body.appendChild(pre);
    }
  }
}

function replace(err) {
  var result = {};
  errorProps.forEach(function(key) {
    var val = err[key];
    if (typeof val !== 'undefined') {
      if (typeof val === 'number')
        result[key] = val;
      else
        result[key] = String(val).replace(ansiRegex, '');
    }
  });
  return '!' + template + '(' + JSON.stringify(result) + ')';
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
