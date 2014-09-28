// Browserify plugin to write failed build messages to the output file

'use strict';

var through = require('through2');
var extend = require('util')._extend;

function errorify(b, opts_) {
  var opts = extend({}, opts_);

  if (typeof opts.logger !== 'function') {
    opts.logger = function(err) {
      console.log('errorify: %s', err.toString());
    };
  }

  // "writer" should return a string that will become the
  // contents of a failed build file
  if (typeof opts.writer !== 'function') {
    opts.writer = function(err) {
      var msg = JSON.stringify(err.toString());
      return (
        'var BROWSERIFY_ERROR = ' + msg + ';' +
        '(typeof alert === \'function\' ? alert : console.error)(BROWSERIFY_ERROR);\n');
    };
  }

  // Whether to re-emit errors
  opts.silent = ('silent' in opts ? !!opts.silent : true);

  var bundle = b.bundle.bind(b);
  b.bundle = function(cb) {
    var stream = through();
    var eof = false;

    bundle(function(err, src) {

      // When there is an error, we are called twice.
      if (eof) return;

      if (err) {
        opts.logger(err.toString());
        src = opts.writer(err);
        // If you emit an 'error', the pipeline ends there
        b.emit('_error', err);
        if (!opts.silent) {
          b.emit('error', err);
        }
      }

      if (cb) {
        cb(null, src);
      }

      stream.push(src);
      stream.push(null);

      eof = true;
    });

    return stream;
  };
}

module.exports = errorify;
