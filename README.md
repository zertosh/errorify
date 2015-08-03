# errorify

A [browserify](https://github.com/substack/node-browserify) plugin that writes the error message of a failed build to the output file, rendering it in the browser.

[![Build Status](https://travis-ci.org/zertosh/errorify.svg?branch=master&style=flat)](https://travis-ci.org/zertosh/errorify)

## Example

```sh
watchify index.js -o bundle.js -p errorify
```

After adding the plugin to your `browserify` instance, `errorify` prevents `bundle()` from emitting `error`'s. All errors are trapped, including: invalid syntax in the source, a missing dependency, a failed transform, etc. When the error message is written to the output file, it is written to the DOM in a `<pre>` tag (or `console.error` if we are not in a browser environment). 

During development, it might look like this: 

![es6](http://i.imgur.com/Pen6bYu.png)

Only the `bundle()` stream is rewritten. If you pass in a callback, it'll get the expected `err` and `body` arguments.

`errorify` is meant to be used with something like [watchify](https://github.com/substack/watchify). It saves you a trip to the terminal to see why a build failed.

Keep in mind that since errors are no longer emitted, all builds appear "successful". Careful not to deploy broken code.

_Note: Only tested with Browserify 9+_

## Usage

### API

```js
var browserify = require('browserify');
var errorify = require('errorify');
var b = browserify({ /*...*/ });
b.plugin(errorify, /* errorify options */);
```

#### Options

* `replacer` _(optional)_ is a function that takes an error as its first argument, and returns a string that will be used as the output bundle.

### CLI

After installing `errorify` as a local devDependency, you can use the `--plugin` or `-p` option like so:

```sh
watchify index.js -o bundle.js -p errorify
```

### CSS Customization

The added `<pre>` tag has the class name `errorify`, so you can customize errors in your page like so:

```css
body > .errorify {
  color: red;
  font-family: 'Consolas', monospace;
  padding: 5px 10px;
}
```

## License

MIT.
