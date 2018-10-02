"use strict";

const formatParts  = require("sprintf-kit/format-parts")
    , hasAnsi      = require("has-ansi")
    , resolveParts = require("./resolve-format-parts");

module.exports = event => {
	if (event.message) return event.message;
	const { logger } = event;

	const parts = resolveParts(...event.messageTokens);
	if (logger.messageContentDecorator) {
		parts.literals = parts.literals.map(literal => logger.messageContentDecorator(literal));
		for (const substitution of parts.substitutions) {
			const { placeholder, value } = substitution;
			if (
				placeholder.type === "s" &&
				placeholder.flags &&
				placeholder.flags.includes("#") &&
				!hasAnsi(value)
			) {
				// Raw string
				substitution.value = logger.messageContentDecorator(value);
			}
		}
	}
	event.messageContent = formatParts(parts);

	event.message = [logger.levelMessagePrefix, logger.namespaceMessagePrefix, event.messageContent]
		.filter(Boolean)
		.join(" ");
	return event.message;
};
