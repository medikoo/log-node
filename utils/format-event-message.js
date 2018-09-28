"use strict";

const toNaturalNumber    = require("es5-ext/number/to-pos-integer")
    , getFormatResolver  = require("sprintf-kit/get-resolver")
    , getModifiers       = require("cli-sprintf-format/get-modifiers")
    , colorsSupportLevel = require("../lib/colors-support-level");

// Resolve intended inspect depth
let inspectDepth = Number(process.env.LOG_INSPECT_DEPTH || process.env.DEBUG_DEPTH);
if (inspectDepth && inspectDepth !== Infinity) inspectDepth = toNaturalNumber(inspectDepth);
if (!inspectDepth) inspectDepth = null;

const formatResolver = getFormatResolver(getModifiers({ inspectDepth, colorsSupportLevel }));

module.exports = event => {
	if (event.message) return event.message;
	const { logger } = event;

	const formatData = formatResolver(...event.messageTokens);
	let { literals } = formatData;
	if (logger.messageContentDecorator) {
		literals = literals.map(literal => logger.messageContentDecorator(literal));
	}
	const { substitutions, rest } = formatData;

	event.messageContent = "";
	if (literals.length) {
		event.messageContent = literals.reduce(
			(resolved, literal, index) => resolved + substitutions[index - 1] + literal
		);
	}
	if (rest) event.messageContent += rest;

	event.message = [logger.levelMessagePrefix, logger.namespaceMessagePrefix, event.messageContent]
		.filter(Boolean)
		.join(" ");
	return event.message;
};