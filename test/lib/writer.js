"use strict";

const path            = require("path")
    , test            = require("tape")
    , requireUncached = require("ncjsm/require-uncached")
    , resolveSync     = require("ncjsm/resolve/sync")
    , overrideEnv     = require("process-utils/override-env");

const resolveUncached = callback => {
	const { restoreEnv } = overrideEnv();
	try {
		return requireUncached(() => {
			const uniGlobalPath = resolveSync(path.dirname(require.resolve("log")), "uni-global")
				.realPath;
			const uniGlobal = {};
			require(uniGlobalPath);
			require.cache[uniGlobalPath].exports = function () { return uniGlobal; };
			callback();
			const LogNodeWriter = require("../../lib/writer");
			return { log: require("log"), initializeWriter: options => new LogNodeWriter(options) };
		});
	} finally {
		restoreEnv();
	}
};

test("lib/writer", t => {
	t.test(t => {
		const { log, initializeWriter } = resolveUncached(
			() => (require("supports-color").stderr = false)
		);
		initializeWriter(null); // null passed to test no options recoverys
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
		t.plan(4);
		const { log, initializeWriter } = resolveUncached(
			() => (require("supports-color").stderr = { level: 1 })
		);
		initializeWriter({ defaultNamespace: "marko" });
		const originalWrite = process.stderr.write;
		process.stderr.write = string =>
			t.equal(
				string,
				"\x1B[91m×\x1B[39m \x1b[31msome \x1b[39m" +
					"\x1b[32mfoo\x1b[39m\x1b[31m error\x1b[39m\n",
				"Should decorate error logs when colors are enabled"
			);
		log.error("some %s error", "foo");
		process.stderr.write = string =>
			t.equal(
				string,
				"\x1B[93m‼\x1B[39m \x1b[33msome \x1b[39m\x1b[33m12" +
					"\x1b[39m\x1b[33m warning\x1b[39m\n",
				"Should decorate warning logs when colors are enabled"
			);
		log.warning("some %d warning", 12);
		process.stderr.write = string =>
			t.equal(
				string,
				"\x1B[93m‼\x1B[39m \x1b[33msome \x1b[39m" +
					"\x1b[33mmarko\nfoo\x1b[39m\x1b[33m warning\x1b[39m\n",
				"Should decorate raw strings in warning logs when colors are enabled"
			);
		log.warning("some %#s warning", "marko\nfoo");
		process.stderr.write = string =>
			t.equal(
				string,
				"\x1B[93m‼\x1B[39m \x1b[33msome \x1b[39mmarko\n" +
					"\x1b[33mfoo\x1b[39m\x1b[33m warning\x1b[39m\n",
				"Should not decorate raw strings that contain ANSI codes in warning logs " +
					"when colors are enabled"
			);
		log.warning("some %#s warning", "marko\n\x1b[33mfoo\x1b[39m");
		process.stderr.write = originalWrite;
	});
	t.end();
});
