# errorify

A [browserify](https://github.com/substack/node-browserify) plugin that writes the error message of a failed build to the output file.

After adding the plugin to your `browserify` instance, `errorify` prevents `bundle()` from emitting `error`'s. All errors are trapped, including: invalid syntax in the source, a missing dependency, a failed transform, etc. When the error message is written to the output file, it is wrapped in an `alert`, so loading the file notifies you immediately that the build failed and why.

`errorify` is meant to be used with something like [watchify](https://github.com/substack/watchify). It saves you a trip to the terminal to see why a build failed.

Keep in mind that since errors are no longer emitted, all builds appear "successful". Careful not to deploy broken code.

_Note: Only tested with Browserify 5+_

## Options

- `logger` _(optional)_

  By default, when there is an error, `errorify` will `console.log` it. Pass in a `logger` to override this.

- `writer` _(optional)_

  A function that receives the error object as its first argument, and whose return value is what is used as the build source.

## Usage

```js
var browserify = require('browserify');
var errorify = require('errorify');
var b = browserify({ /* stuff */ });
b.plugin(errorify);
```
