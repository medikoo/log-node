"use strict";

const getPartsResolver   = require("sprintf-kit/get-parts-resolver")
    , getModifiers       = require("cli-sprintf-format/get-modifiers")
    , colorsSupportLevel = require("../lib/colors-support-level")
    , inspectDepth       = require("../lib/inspect-depth");

module.exports = getPartsResolver(getModifiers({ inspectDepth, colorsSupportLevel }));
