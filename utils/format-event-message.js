"use strict";

const formatParts  = require("sprintf-kit/format-parts")
    , resolveParts = require("./resolve-format-parts");

module.exports = event => {
	if (event.message) return event.message;
	const { logger } = event;

	const parts = resolveParts(...event.messageTokens);
	if (logger.messageContentDecorator) {
		parts.literals = parts.literals.map(literal => logger.messageContentDecorator(literal));
	}
	event.messageContent = formatParts(parts);

	event.message = [logger.levelMessagePrefix, logger.namespaceMessagePrefix, event.messageContent]
		.filter(Boolean)
		.join(" ");
	return event.message;
};
