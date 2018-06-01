# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.0"></a>
# [2.0.0](https://github.com/medikoo/log4-node/compare/v1.0.0...v2.0.0) (2018-06-01)


### Features

* expose handler as a function ([7222966](https://github.com/medikoo/log4-node/commit/7222966))
* Rely on LOG_COLORS not LOG4_COLORS ([20b9ec5](https://github.com/medikoo/log4-node/commit/20b9ec5))
* Update to rely on log4 and use its conventions ([980cbf7](https://github.com/medikoo/log4-node/commit/980cbf7))


### BREAKING CHANGES

* - Drop support for log4 v2
- Drop support for Node.js v4
- Switch formatter to rely on 'sprintf-kit' instead of native Node.js one
- Drop support for LOG_COLORS env var (instead DEBUG_COLORS should be used)
- Change presentation of prefixes
* Since now handler needs to be initialzed as:

```javascript
require('log4-nodejs')();
```



<a name="1.0.0"></a>
# 1.0.0 (2018-03-22)
