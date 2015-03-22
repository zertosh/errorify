'use strict';

var through = require('through2');

// https://github.com/sindresorhus/ansi-regex/blob/47fb974/index.js
var ansiRegex = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/g;

var errorProps = ['stack', 'name', 'message', 'fileName', 'lineNumber', 'columnNumber'];

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

function replace(err_) {
  var err = {};
  errorProps.forEach(function(key) {
    if (err_[key]) {
      err[key] = String(err_[key]).replace(ansiRegex, '');
    }
  });
  return '!' + template + '(' + JSON.stringify(err) + ')';
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
