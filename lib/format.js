// format util which  reflects color and inspect settings with which logger is run

"use strict";

const formatParts  = require("sprintf-kit/format-parts")
    , resolveParts = require("./resolve-format-parts");

module.exports = (format, ...params) => formatParts(resolveParts(format, ...params));
