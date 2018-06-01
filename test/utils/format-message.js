"use strict";

const d               = require("d")
    , test            = require("tape")
    , requireUncached = require("cjs-module/require-uncached")
    , overrideEnv     = require("process-utils/override-env");

test("formatMessage", t => {
	t.test(t => {
		const { logger, formatMessage } = overrideEnv(() =>
			requireUncached(
				[
					require.resolve("log4/writer-utils/emitter"), require.resolve("log4"),
					require.resolve("../../utils/format-message"),
					require.resolve("supports-color"),
					require.resolve("../../lib/colors-support-level")
				],
				() => {
					require("supports-color").stderr = false;
					return {
						logger: require("log4"),
						formatMessage: require("../../utils/format-message")
					};
				}
			));
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
					"foo bar %d %f %i %j %o %O then", 20.2, 21.21, 22.22, testObj, testObj, testObj,
					"rest", "arg"
				],
				logger: namespacedLogger
			}),
			"debug foo foo bar 20.2 21.21 22 {\n  \"foo\": \"bar\"\n} " +
				"{ foo: 'bar', [hidden]: 'elo' } { foo: 'bar' } then 'rest' 'arg'",
			"Supports sprintf formatting with rest params"
		);
		t.equal(
			formatMessage({ messageTokens: [testObj, 21.21], logger: namespacedLogger }),
			"debug foo { foo: 'bar' } 21.21", "Supports no format string"
		);
		const logEvent = { message: "foo", logger: namespacedLogger };
		t.equal(formatMessage(logEvent), "foo", "Passes through alredy generated message");
		t.end();
	});
	t.test(t => {
		const { logger, formatMessage } = overrideEnv(() =>
			requireUncached(
				[
					require.resolve("log4/writer-utils/emitter"), require.resolve("log4"),
					require.resolve("../../utils/format-message"),
					require.resolve("supports-color"),
					require.resolve("../../lib/colors-support-level")
				],
				() => {
					process.env.LOG_INSPECT_DEPTH = "1";
					require("supports-color").stderr = false;
					return {
						logger: require("log4"),
						formatMessage: require("../../utils/format-message")
					};
				}
			));
		t.equal(
			formatMessage({ messageTokens: [{ foo: 12, bar: { elo: { frelo: 22 } } }], logger }),
			"{ foo: 12, bar: { elo: [Object] } }",
			"Supports customization of inspect depth via LOG_INSPECT_DEPTH var"
		);
		t.end();
	});

	t.end();
});
