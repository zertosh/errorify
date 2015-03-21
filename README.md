# errorify

A [browserify](https://github.com/substack/node-browserify) plugin that writes the error message of a failed build to the output file.

After adding the plugin to your `browserify` instance, `errorify` prevents `bundle()` from emitting `error`'s. All errors are trapped, including: invalid syntax in the source, a missing dependency, a failed transform, etc. When the error message is written to the output file, it is wrapped in an `alert` (or `console.error` if `alert` isn't available), so loading the file notifies you immediately that the build failed and why.

Only the `bundle()` stream is rewritten. If you pass in a callback, it'll get the expected `err` and `body` arguments.

`errorify` is meant to be used with something like [watchify](https://github.com/substack/watchify). It saves you a trip to the terminal to see why a build failed.

Keep in mind that since errors are no longer emitted, all builds appear "successful". Careful not to deploy broken code.

_Note: Only tested with Browserify 9+_

## Usage

```js
var browserify = require('browserify');
var errorify = require('errorify');
var b = browserify({ /* stuff */ });
b.plugin(errorify);
```
