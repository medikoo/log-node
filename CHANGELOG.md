# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.3.1"></a>
## [2.3.1](https://github.com/medikoo/log4-node/compare/v2.3.0...v2.3.1) (2018-08-06)


### Bug Fixes

* do not decorate placeholders with message decorators ([dcaa9ca](https://github.com/medikoo/log4-node/commit/dcaa9ca))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/medikoo/log4-node/compare/v2.2.0...v2.3.0) (2018-06-05)


### Features

* show warning logs in yellow when colors enabled ([fe7564b](https://github.com/medikoo/log4-node/commit/fe7564b))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/medikoo/log4-node/compare/v2.1.1...v2.2.0) (2018-06-05)


### Features

* make error colors red when colors are enabled ([9682138](https://github.com/medikoo/log4-node/commit/9682138))
* Support logger.messageContentDecorator function ([f194169](https://github.com/medikoo/log4-node/commit/f194169))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/medikoo/log4-node/compare/v2.1.0...v2.1.1) (2018-06-05)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/medikoo/log4-node/compare/v2.0.0...v2.1.0) (2018-06-04)


### Bug Fixes

* use less confusing "i" symbol for notice ([8c545f5](https://github.com/medikoo/log4-node/commit/8c545f5))


### Features

* improve string formatting ([7d2ea73](https://github.com/medikoo/log4-node/commit/7d2ea73))



<a name="2.0.0"></a>

# [2.0.0](https://github.com/medikoo/log4-node/compare/v1.0.0...v2.0.0) (2018-06-01)

### BREAKING CHANGES

*   Drop support for log4 v2
*   Drop support for Node.js v4
*   Switch formatter to rely on [sprintf-kit](https://github.com/medikoo/sprintf-kit) instead of native Node.js one
*   Drop support for LOG4_COLORS env var (instead DEBUG_COLORS should be used)
*   Change presentation of prefixes

*   Hndler is exposed as a function and needs to be invoked:

```javascript
require("log4-nodejs")();
```

<a name="1.0.0"></a>

# 1.0.0 (2018-03-22)
