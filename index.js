"use strict";

const isObject            = require("es5-ext/object/is-object")
    , d                   = require("d")
    , clc                 = require("cli-color/bare")
    , rootLogger          = require("log")
    , emitter             = require("log/lib/emitter")
    , registerMaster      = require("log/lib/register-master")
    , setupVisibility     = require("log/lib/setup-visibility")
    , setDefaultNamespace = require("log/lib/get-default-namespace").set
    , colorsSupportLevel  = require("./lib/private/colors-support-level")
    , formatMessage       = require("./utils/format-event-message")
    , levelPrefixes       = require("./utils/level-prefixes")
    , getNamespacePrefix  = require("./utils/get-namespace-prefix");

const WARNING_LEVEL_INDEX = 3, ERROR_LEVEL_INDEX = 4;

const setupPrefixes = levelLogger => {
	levelLogger.levelMessagePrefix = levelPrefixes[levelLogger.level];
	if (colorsSupportLevel) {
		if (levelLogger.levelIndex >= ERROR_LEVEL_INDEX) {
			levelLogger.messageContentDecorator = clc.red;
		} else if (levelLogger.levelIndex === WARNING_LEVEL_INDEX) {
			levelLogger.messageContentDecorator = clc.yellow;
		}
	}
	Object.defineProperty(
		levelLogger, "namespaceMessagePrefix",
		d.gs(function () { return getNamespacePrefix(this); })
	);
};

module.exports = (options = {}) => {
	if (!isObject(options)) options = {};

	// Ensure it's the only log writer initialzed in a process
	registerMaster();

	if (options.defaultNamespace) setDefaultNamespace(options.defaultNamespace);

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
