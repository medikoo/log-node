"use strict";

const resolveParts = require("./parts-resolver");

module.exports = event => {
	if (event.message) return event.message;
	const { logger } = event;

	const formatData = resolveParts(...event.messageTokens);
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
