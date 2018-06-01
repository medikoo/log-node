[![*nix build status][nix-build-image]][nix-build-url]
[![Windows build status][win-build-image]][win-build-url]
[![Tests coverage][cov-image]][cov-url]
![Transpilation status][transpilation-image]
[![npm version][npm-image]][npm-url]

# log4-nodejs

## [log4](https://github.com/medikoo/log4/) log writer for typical [Node.js](https://nodejs.org/) processes

*   Writes logs to process `stderr` stream.
*   Supports printf-like message formatting. See -> [Output message formatting](https://github.com/medikoo/log4#output-message-formatting) for detailed information
*   Log level visbility threshold can be configured via [`LOG_LEVEL`](https://github.com/medikoo/log4#log_level) env variable (defaults to `warning`)
*   Extra debug logs output can be controlled via via [`LOG_DEBUG`](https://github.com/medikoo/log4#log_debug) env variable (if `LOG_DEBUG` is not present, settings are read from `DEBUG`)
*   Detects terminal colors support and outputs colored logs if possible.
    Behavior can overriden via `DEBUG_COLORS` env variable
*   Object inspection depth defaults to `4`, but can be overriden via `LOG_INSPECT_DEPTH` (fallbacks to `DEBUG_DEPTH` if provided)

### Usage

At beginning of main module of your program do:

```javascript
require("log4-nodejs")();
```

### Tests

    $ npm test

[nix-build-image]: https://semaphoreci.com/api/v1/medikoo-org/log4-nodejs/branches/master/shields_badge.svg
[nix-build-url]: https://semaphoreci.com/medikoo-org/log4-nodejs
[win-build-image]: https://ci.appveyor.com/api/projects/status/tqetc30h571osc2n?svg=true
[win-build-url]: https://ci.appveyor.com/project/medikoo/log4-nodejs
[cov-image]: https://img.shields.io/codecov/c/github/medikoo/log4-nodejs.svg
[cov-url]: https://codecov.io/gh/medikoo/log4-nodejs
[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
[npm-image]: https://img.shields.io/npm/v/log4-nodejs.svg
[npm-url]: https://www.npmjs.com/package/log4-nodejs
