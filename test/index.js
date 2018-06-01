"use strict";

const test            = require("tape")
    , requireUncached = require("cjs-module/require-uncached")
    , overrideEnv     = require("process-utils/override-env");

test("log4-nodejs", t => {
	const { log, initializeWriter } = overrideEnv(() =>
		requireUncached(
			[
				require.resolve("log4"), require.resolve("log4/writer-utils/emitter"),
				require.resolve("log4/writer-utils/register-master"),
				require.resolve("log4/writer-utils/setup-visibility"),
				require.resolve("supports-color"), require.resolve("../lib/colors-support-level"),
				require.resolve("../")
			],
			() => {
				require("supports-color").stderr = false;
				return { log: require("log4"), initializeWriter: require("../") };
			}
		));
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
