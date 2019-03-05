"use strict";

const test            = require("tape")
    , requireUncached = require("cjs-module/require-uncached")
    , overrideEnv     = require("process-utils/override-env");

const resolveUncached = callback => {
	const { restoreEnv } = overrideEnv();
	try {
		return requireUncached(
			[
				require.resolve("log"), require.resolve("log/writer-utils/emitter"),
				require.resolve("log/writer-utils/get-default-namespace"),
				require.resolve("../../utils/get-namespace-prefix"),
				require.resolve("supports-color"), require.resolve("../../lib/private/colors-support-level")
			],
			() => {
				callback();
				return {
					log: require("log"),
					getNamespacePrefix: require("../../utils/get-namespace-prefix")
				};
			}
		);
	} finally {
		restoreEnv();
	}
};

test("getNamespacePrefix", t => {
	t.test("Should map colors per each namespace", t => {
		t.test("In rich colors environment", t => {
			const { log, getNamespacePrefix } = resolveUncached(
				() => (require("supports-color").stderr = { level: 2 })
			);

			const prefix = getNamespacePrefix(log.get("foo"));
			t.equal(typeof prefix, "string");
			t.equal(typeof getNamespacePrefix(log.get("foo").get("bar")), "string");
			t.notEqual(
				getNamespacePrefix(log.get("foo")), getNamespacePrefix(log.get("foo").get("bar"))
			);
			t.equal(
				getNamespacePrefix(log.get("foo").get("bar")),
				getNamespacePrefix(log.get("foo").get("bar"))
			);
			t.end();
		});
		t.test("In basic colors environment", t => {
			const { log, getNamespacePrefix } = resolveUncached(
				() => (require("supports-color").stderr = { level: 1 })
			);
			const prefix = getNamespacePrefix(log.get("foo"));
			t.equal(typeof prefix, "string");
			t.equal(typeof getNamespacePrefix(log.get("foo").get("bar")), "string");
			t.notEqual(
				getNamespacePrefix(log.get("foo")), getNamespacePrefix(log.get("foo").get("bar"))
			);
			t.equal(
				getNamespacePrefix(log.get("foo").get("bar")),
				getNamespacePrefix(log.get("foo").get("bar"))
			);
			t.end();
		});
		t.end();
	});
	t.test("Should map namespace name in non-color environment", t => {
		const { log, getNamespacePrefix } = resolveUncached(
			() => (require("supports-color").stderr = false)
		);

		t.equal(getNamespacePrefix(log.get("foo")), log.get("foo").namespace);
		t.equal(getNamespacePrefix(log.get("foo").get("bar")), log.get("foo").get("bar").namespace);
		t.end();
	});

	t.test("Should not show default namespace", t => {
		const { log, getNamespacePrefix } = resolveUncached(() => {
			require("supports-color").stderr = false;
			require("log/writer-utils/get-default-namespace").set("marko");
		});

		t.equal(getNamespacePrefix(log.get("foo")), log.get("foo").namespace);
		t.equal(getNamespacePrefix(log.get("foo").get("bar")), log.get("foo").get("bar").namespace);
		t.equal(getNamespacePrefix(log.get("marko")), null);
		t.equal(getNamespacePrefix(log.get("marko:bar")), ":bar");
		t.end();
	});

	t.test("Should support DEBUG_COLORS env var", t => {
		t.test("Should force basic colors environment, if \"on\" in non-color environment", t => {
			const { log, getNamespacePrefix } = resolveUncached(() => {
				require("supports-color").stderr = false;
				process.env.DEBUG_COLORS = "on";
				return {
					log: require("log"),
					getNamespacePrefix: require("../../utils/get-namespace-prefix")
				};
			});

			const prefix = getNamespacePrefix(log.get("foo"));
			t.equal(typeof prefix, "string");
			t.notEqual(prefix, log.get("foo").namespace);
			t.end();
		});
		t.test("Should turn off colors, if \"off\" in colors environment", t => {
			const { log, getNamespacePrefix } = resolveUncached(() => {
				require("supports-color").stderr = { level: 2 };
				process.env.DEBUG_COLORS = "no";
			});

			t.equal(getNamespacePrefix(log.get("foo")), log.get("foo").namespace);
			t.end();
		});
		t.test("Should not have effect in rich colors environment, if \"on\"", t => {
			const { log, getNamespacePrefix } = resolveUncached(() => {
				require("supports-color").stderr = { level: 2 };
				process.env.DEBUG_COLORS = "yes";
			});

			const prefix = getNamespacePrefix(log.get("foo"));
			t.equal(typeof prefix, "string");
			t.notEqual(prefix, log.get("foo").namespace);
			t.end();
		});
		t.test("Should have no effect, if not recognized value", t => {
			const { log, getNamespacePrefix } = resolveUncached(() => {
				require("supports-color").stderr = { level: 2 };
				process.env.DEBUG_COLORS = "habla";
			});

			const prefix = getNamespacePrefix(log.get("foo"));
			t.equal(typeof prefix, "string");
			t.notEqual(prefix, log.get("foo").namespace);
			t.end();
		});
		t.end();
	});
	t.test("Should reuse namespace color across levels", t => {
		const { log, getNamespacePrefix } = resolveUncached(() => {
			require("supports-color").stderr = { level: 1 };
		});

		getNamespacePrefix(log.get("foo"));
		getNamespacePrefix(log.error.get("foo"));
		t.equal(log.get("foo").namespaceAnsiColor, log.error.get("foo").namespaceAnsiColor);
		[1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((otherLogger, index) => {
			const namespacedLogger = log.get(`foo${ index }`);
			getNamespacePrefix(namespacedLogger);
			t.equal(isFinite(namespacedLogger.namespaceAnsiColor), true);
			t.notEqual(otherLogger.namespaceAnsiColor, namespacedLogger.namespaceAnsiColor);
			return namespacedLogger;
		}, log.get("foo"));
		t.end();
	});

	t.test("Should return null for non-namespaced logger", t => {
		const { log, getNamespacePrefix } = resolveUncached(() => {
			require("supports-color").stderr = { level: 2 };
		});
		t.equal(getNamespacePrefix(log), null);
		t.end();
	});
	t.end();
});
