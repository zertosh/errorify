'use strict';

var browserify = require('browserify');
var concatStream = require('concat-stream');
var extend = require('util')._extend;
var test = require('tape');
var through = require('through2');
var vm = require('vm');

var concat = concatStream.bind(null, {encoding: 'string'});

// Types of Browserify errors: Bad syntax, missing dependency, or a transform error
// Error can happen in the Entry file, or in Dependency

test('errorify', function(t) {

  var errorify = require('errorify');

  var REAL_ERROR_VAR = 'BROWSERIFY_ERROR';
  var TEST_ERROR_VAR = 'BROWSERIFY_TEST_ERROR';
  var MUTE_OPTS = {
    logger: function() {},
    writer: function(err) {
      return 'require = "' + TEST_ERROR_VAR + '";';
    }
  };

  t.test('exports', function(t) {
    t.equal(typeof errorify, 'function', 'should export a function');
    t.end();
  });

  t.test('successful build with repeat "bundle" calls', function(t) {
    t.plan(4);
    var b = browserify();
    b.require('./test/fixtures/good/entry.js', {expose: 'entry'});
    b.plugin(errorify);
    b.bundle()
      .pipe(concat(function(src) {
        var c = {};
        vm.runInNewContext(src, c);
        t.equal(typeof c.require('entry').dep1.dep2.identity, 'function', 'should work with pipe');
      }));
    b.bundle()
      .pipe(concat(function(src) {
        t.notOk(contains(src, REAL_ERROR_VAR), 'should not have error message with pipe');
      }));
    b.bundle(function(err, src) {
      var c = {};
      vm.runInNewContext(src, c);
      t.equal(typeof c.require('entry').dep1.dep2.identity, 'function', 'should work with callback');
    });
    b.bundle(function(err, src) {
      t.notOk(contains(src, REAL_ERROR_VAR), 'should not have error message with callback');
    });
  });

  t.test('options', function(t) {
    t.plan(3);
    var b = browserify('./test/fixtures/bad-syntax-entry.js');
    b.plugin(errorify, {
      logger: function(err) {
        t.ok(contains(err, 'Error: Parsing file'), 'should have called logger with error message');
      },
      writer: function(err) {
        t.ok(contains(err, 'Error: Parsing file'), 'should have called writer with error message');
        return TEST_ERROR_VAR;
      }
    });
    b.bundle(function(err, src){
      t.ok(contains(src, TEST_ERROR_VAR), 'should have used writer\'s error message');
    });
  });

  t.test('silent option on by default', function(t) {
    t.plan(1);
    var b = browserify('./test/fixtures/bad-syntax-entry.js');
    b.plugin(errorify, MUTE_OPTS);
    b.on('error', function() {
      t.fail('error event should not happen');
    });
    b.on('_error', function() {
      t.pass('_error event should happen');
    });
    b.bundle();
  });

  t.test('silent option off', function(t) {
    t.plan(2);
    var b = browserify('./test/fixtures/bad-syntax-entry.js');
    b.plugin(errorify, extend({silent:false}, MUTE_OPTS));
    b.on('error', function() {
      t.pass('error event should happen');
    });
    b.on('_error', function() {
      t.pass('_error event should happen');
    });
    b.bundle();
  });

  t.test('bad syntax in entry file', function(t) {
    t.plan(1);
    var b = browserify('./test/fixtures/bad-syntax-entry.js');
    b.plugin(errorify, MUTE_OPTS);
    b.bundle(function(err, src) {
      var c = {};
      vm.runInNewContext(src, c);
      t.equal(c.require, TEST_ERROR_VAR, 'should have error message when there is a syntax error in the entry');
    });
  });

  t.test('bad syntax in dep file', function(t) {
    t.plan(1);
    var b = browserify('./test/fixtures/bad-syntax-dep/entry.js');
    b.plugin(errorify, MUTE_OPTS);
    b.bundle(function(err, src) {
      var c = {};
      vm.runInNewContext(src, c);
      t.equal(c.require, TEST_ERROR_VAR, 'should have error message when there is a syntax error in dep');
    });
  });

  t.test('missing dependency in entry file', function(t) {
    t.plan(1);
    var b = browserify('./test/fixtures/missing-dep-entry.js');
    b.plugin(errorify, MUTE_OPTS);
    b.bundle(function(err, src) {
      var c = {};
      vm.runInNewContext(src, c);
      t.equal(c.require, TEST_ERROR_VAR, 'should have error message when entry is missing a dep');
    });
  });

  t.test('missing dependency in dependency file', function(t) {
    t.plan(1);
    var b = browserify('./test/fixtures/missing-dep-dep/entry.js');
    b.plugin(errorify, MUTE_OPTS);
    b.bundle(function(err, src) {
      var c = {};
      vm.runInNewContext(src, c);
      t.equal(c.require, TEST_ERROR_VAR, 'should have error message when dep is missing a dep');
    });
  });

  test.only('error in transform', function(t) {
    t.plan(1);
    var b = browserify('./test/fixtures/good/entry.js');
    b.transform(function() {
      return through(function(chunk, enc, cb) {
        this.emit('error', new Error());
        cb();
      });
    });
    b.plugin(errorify, MUTE_OPTS);
    b.bundle(function(err, src) {
      var c = {};
      vm.runInNewContext(src, c);
      t.equal(c.require, TEST_ERROR_VAR, 'should have error message when transform fails on entry');
    });
  });

  t.end();
});

function contains(source, searchValue) {
  return source.toString().indexOf(searchValue) !== -1;
}
