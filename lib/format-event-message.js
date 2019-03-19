"use strict";

const formatParts          = require("sprintf-kit/format-parts")
    , hasAnsi              = require("has-ansi")
    , { blackBright }      = require("cli-color/bare")
    , getTimestampResolver = require("log/lib/get-timestamp-resolver")
    , colorsSupportLevel   = require("./private/colors-support-level")
    , resolveParts         = require("./resolve-format-parts");

const resolveTimestamp = (() => {
	if (!process.env.LOG_TIME) return null;
	const resolve = getTimestampResolver(process.env.LOG_TIME);
	if (!colorsSupportLevel) return resolve;
	return () => blackBright(resolve());
})();

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
	if (resolveTimestamp) event.messageTimestamp = resolveTimestamp();
	event.messageContent = formatParts(parts);

	event.message = [
		event.messageTimestamp, logger.levelMessagePrefix, logger.namespaceMessagePrefix,
		event.messageContent
	]
		.filter(Boolean)
		.join(" ");
	return event.message;
};
