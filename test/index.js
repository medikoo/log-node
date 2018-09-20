"use strict";

const test            = require("tape")
    , requireUncached = require("cjs-module/require-uncached")
    , overrideEnv     = require("process-utils/override-env");

const resolveUncached = callback => {
	const { restoreEnv } = overrideEnv();
	try {
		return requireUncached(
			[
				require.resolve("log4"), require.resolve("log4/writer-utils/emitter"),
				require.resolve("log4/writer-utils/register-master"),
				require.resolve("log4/writer-utils/setup-visibility"),
				require.resolve("supports-color"), require.resolve("../lib/colors-support-level"),
				require.resolve("../")
			],
			() => {
				callback();
				return { log: require("log4"), initializeWriter: require("../") };
			}
		);
	} finally {
		restoreEnv();
	}
};

test("log4-nodejs", t => {
	t.test(t => {
		const { log, initializeWriter } = resolveUncached(
			() => (require("supports-color").stderr = false)
		);
		initializeWriter();
		const originalWrite = process.stderr.write;
		let isInvoked = false;
		process.stderr.write = string => {
			t.equal(
				string,
				`${ log.error.get("elo").levelMessagePrefix } ${
					log.error.get("elo").namespaceMessagePrefix
				} foo bar\n`,
				"Should write logs for enabled loggers to stderr"
			);
			isInvoked = true;
		};
		log("not enabled");
		t.equal(isInvoked, false, "Should not write logs of disabled loggers");
		log.error.get("elo")("foo bar");
		t.equal(isInvoked, true, "Should write logs immediately");
		process.stderr.write = originalWrite;
		t.end();
	});
	t.test(t => {
		t.plan(2);
		const { log, initializeWriter } = resolveUncached(
			() => (require("supports-color").stderr = { level: 1 })
		);
		initializeWriter();
		const originalWrite = process.stderr.write;
		process.stderr.write = string =>
			t.equal(
				string, "× \x1b[31msome \x1b[39mfoo\x1b[31m error\x1b[39m\n",
				"Should decorate error logs when colors are enabled"
			);
		log.error("some %s error", "foo");
		process.stderr.write = string =>
			t.equal(
				string, "‼ \x1b[33msome \x1b[39m12\x1b[33m warning\x1b[39m\n",
				"Should decorate warning logs when colors are enabled"
			);
		log.warning("some %d warning", 12);
		process.stderr.write = originalWrite;
	});
	t.end();
});
