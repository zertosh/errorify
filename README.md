# errorify

A [Browserify](https://github.com/substack/node-browserify) plugin that writes the error message of a failed build to the output.

_Note: Only tested with Browserify 5+_

## Usage

```js
var browserify = require('browserify');
var errorify = require('errorify');
var b = browserify({ /* stuff */ });
b.plugin(errorify);
```
