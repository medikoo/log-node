"use strict";

const getPartsResolver   = require("sprintf-kit/get-parts-resolver")
    , getModifiers       = require("cli-sprintf-format/get-modifiers")
    , colorsSupportLevel = require("../lib/colors-support-level")
    , inspectDepth       = require("../lib/inspect-depth");

const formatPartsResolver = getPartsResolver(getModifiers({ inspectDepth, colorsSupportLevel }));

module.exports = event => {
	if (event.message) return event.message;
	const { logger } = event;

	const formatData = formatPartsResolver(...event.messageTokens);
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
