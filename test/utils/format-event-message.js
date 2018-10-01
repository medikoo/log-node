"use strict";

const d               = require("d")
    , test            = require("tape")
    , requireUncached = require("cjs-module/require-uncached")
    , overrideEnv     = require("process-utils/override-env");

const resolveUncached = callback => {
	const { restoreEnv } = overrideEnv();
	try {
		return requireUncached(
			[
				require.resolve("log4/writer-utils/emitter"), require.resolve("log4"),
				require.resolve("../../utils/parts-resolver"),
				require.resolve("../../utils/format-event-message"),
				require.resolve("supports-color"),
				require.resolve("../../lib/colors-support-level"),
				require.resolve("../../lib/inspect-depth")
			],
			() => {
				callback();
				return {
					logger: require("log4"),
					formatMessage: require("../../utils/format-event-message")
				};
			}
		);
	} finally {
		restoreEnv();
	}
};

test("formatMessage", t => {
	const { logger, formatMessage } = resolveUncached(
		() => (require("supports-color").stderr = false)
	);
	t.equal(
		formatMessage({ messageTokens: ["foo bar"], logger }), "foo bar",
		"Should format message with no prefixes"
	);
	logger.levelMessagePrefix = "debug";
	t.equal(
		formatMessage({ messageTokens: ["foo bar"], logger }), "debug foo bar",
		"Should format message with level prefix"
	);
	const namespacedLogger = logger.get("foo");
	namespacedLogger.namespaceMessagePrefix = "foo";
	t.equal(
		formatMessage({ messageTokens: ["foo bar"], logger: namespacedLogger }),
		"debug foo foo bar", "Should format message with level and namespace prefix"
	);
	const testObj = Object.defineProperties({ foo: "bar" }, { hidden: d("elo") });
	t.equal(
		formatMessage({
			messageTokens: [
				"foo bar %d %f %i %j %o %O then%s", 20.2, 21.21, 22.22, testObj, testObj, testObj,
				"maro", "rest", "arg"
			],
			logger: namespacedLogger
		}),
		"debug foo foo bar 20.2 21.21 22 { \"foo\": \"bar\" } " +
			"{ foo: 'bar', [hidden]: 'elo' } { foo: 'bar' } thenmaro 'rest' 'arg'",
		"Supports sprintf formatting with rest params"
	);
	t.deepEqual(
		formatMessage({ messageTokens: [{ foo: 12, bar: { elo: { frelo: 22 } } }], logger }),
		"debug { foo: 12, bar: { elo: { frelo: 22 } } }", "Supports no format string"
	);
	const logEvent = { message: "foo", logger: namespacedLogger };
	t.equal(formatMessage(logEvent), "foo", "Passes through alredy generated message");
	t.end();
});
