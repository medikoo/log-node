"use strict";

const toNaturalNumber    = require("es5-ext/number/to-pos-integer")
    , { inspect }        = require("util")
    , colorsSupportLevel = require("../lib/colors-support-level");

let inspectDepth = Number(process.env.LOG_INSPECT_DEPTH || process.env.DEBUG_DEPTH);
if (inspectDepth && inspectDepth !== Infinity) inspectDepth = toNaturalNumber(inspectDepth);
if (!inspectDepth) inspectDepth = 4;

const visiblePropertiesInspectOptions = { depth: inspectDepth, colors: colorsSupportLevel };
const allPropertiesInspectOptions = Object.assign(
	{ showHidden: true, showProxy: true }, visiblePropertiesInspectOptions
);

const format = require("sprintf-kit")({
	d: require("sprintf-kit/modifiers/d"),
	f: require("sprintf-kit/modifiers/f"),
	i: require("sprintf-kit/modifiers/i"),
	j: require("sprintf-kit/modifiers/j"),
	o: value => inspect(value, allPropertiesInspectOptions),
	O: value => inspect(value, visiblePropertiesInspectOptions),
	s: require("sprintf-kit/modifiers/s"),
	rest: (args, formatStringData) =>
		`${ formatStringData ? " " : "" }${ args
			.map(arg => inspect(arg, visiblePropertiesInspectOptions))
			.join(" ") }`
});

module.exports = event => {
	if (event.message) return event.message;
	const { logger } = event;
	event.messageContent = format(...event.messageTokens);
	event.message = [logger.levelMessagePrefix, logger.namespaceMessagePrefix, event.messageContent]
		.filter(Boolean)
		.join(" ");
	return event.message;
};
