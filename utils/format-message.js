"use strict";

const toNaturalNumber        = require("es5-ext/number/to-pos-integer")
    , identity               = require("es5-ext/function/identity")
    , generateFormatFunction = require("sprintf-kit")
    , decimalModifier        = require("sprintf-kit/modifiers/d")
    , floatModifier          = require("sprintf-kit/modifiers/f")
    , integerModifier        = require("sprintf-kit/modifiers/i")
    , jsonModifier           = require("sprintf-kit/modifiers/j")
    , stringModifier         = require("sprintf-kit/modifiers/s")
    , { inspect }            = require("util")
    , clc                    = require("cli-color/bare")
    , colorsSupportLevel     = require("../lib/colors-support-level");

// Resolve intended inspect depth
let inspectDepth = Number(process.env.LOG_INSPECT_DEPTH || process.env.DEBUG_DEPTH);
if (inspectDepth && inspectDepth !== Infinity) inspectDepth = toNaturalNumber(inspectDepth);
if (!inspectDepth) inspectDepth = 4;

// Preconfigure inspect options for each case
const visiblePropertiesInspectOptions = {
	breakLength: 120,
	depth: inspectDepth,
	colors: colorsSupportLevel
};
const allPropertiesInspectOptions = Object.assign(
	{ showHidden: true, showProxy: true }, visiblePropertiesInspectOptions
);
const jsonInspectOptions = Object.assign(
	{
		stylize: (str, styleType) => {
			// Hack Node.js inspect to show JSON as JSON
			if (styleType === "name") str = `"${ str }"`;
			else if (styleType === "string") str = `"${ str.slice(1, -1) }"`;
			if (!colorsSupportLevel) return str;
			const style = inspect.styles[styleType];
			if (style === undefined) return str;
			const color = inspect.colors[style];
			return `\u001b[${ color[0] }m${ str }\u001b[${ color[1] }m`;
		}
	},
	visiblePropertiesInspectOptions,
	{ colors: false }
);
const stringInspectOptions = Object.assign({}, visiblePropertiesInspectOptions, { colors: false });

// format utils
const decorateStringValue = colorsSupportLevel ? clc.green : identity;
const decorateInvalidValue = colorsSupportLevel ? clc.blackBright : identity;
const getModifier = (basicModifier, inspectModifier) => value => {
	const stringValue = basicModifier(value);
	if (stringValue[0] === "<") return decorateInvalidValue(stringValue); // pass thru errors
	return inspectModifier(stringValue);
};

const format = generateFormatFunction({
	d: getModifier(decimalModifier, stringValue =>
		inspect(Number(stringValue), visiblePropertiesInspectOptions)),
	f: getModifier(floatModifier, stringValue =>
		inspect(Number(stringValue), visiblePropertiesInspectOptions)),
	i: getModifier(integerModifier, stringValue =>
		inspect(Number(stringValue), visiblePropertiesInspectOptions)),
	j: getModifier(jsonModifier, stringValue =>
		inspect(JSON.parse(stringValue), jsonInspectOptions)),
	o: value => inspect(value, allPropertiesInspectOptions),
	O: value => inspect(value, visiblePropertiesInspectOptions),
	s: getModifier(stringModifier, stringValue =>
		decorateStringValue(inspect(stringValue, stringInspectOptions).slice(1, -1))),
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
