"use strict";

const d                  = require("d")
    , rootLogger         = require("log4")
    , emitter            = require("log4/writer-utils/emitter")
    , registerMaster     = require("log4/writer-utils/register-master")
    , setupVisibility    = require("log4/writer-utils/setup-visibility")
    , formatMessage      = require("./utils/format-message")
    , levelPrefixes      = require("./utils/level-prefixes")
    , getNamespacePrefix = require("./utils/get-namespace-prefix");

const setupPrefixes = levelLogger => {
	levelLogger.levelMessagePrefix = levelPrefixes[levelLogger.level];
	Object.defineProperty(
		levelLogger, "namespaceMessagePrefix",
		d.gs(function () { return getNamespacePrefix(this); })
	);
};

module.exports = () => {
	// Ensure it's the only log4 writer initialzed in a process
	registerMaster();

	// Read logs visiblity settings from env variables
	setupVisibility(
		process.env.LOG_LEVEL, (process.env.LOG_DEBUG || process.env.DEBUG || "").split(",")
	);

	// Resolve level and namespace log message prefixes
	// - for already initialized loggers
	rootLogger.getAllInitializedLevels().forEach(setupPrefixes);
	// - for loggers to be initialized
	emitter.on("init", event => { if (!event.logger.namespace) setupPrefixes(event.logger); });

	// Write logs to stderr
	emitter.on("log", event => {
		if (!event.logger.isEnabled) return;
		formatMessage(event);
		process.stderr.write(`${ event.message }\n`);
	});
};
