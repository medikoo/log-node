"use strict";

const colorsSupportLevel = require("../lib/colors-support-level");

if (!colorsSupportLevel) {
	module.exports = logger => logger.namespace;
	return;
}

const colors = (() => {
	if (colorsSupportLevel >= 2) {
		return [
			20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75,
			76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160,
			161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185,
			196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221
		];
	}
	return [6, 2, 3, 4, 5, 1];
})();
let lastColorIndex = 0;

module.exports = logger => {
	const color = (() => {
		if (logger.namespaceAnsiColor) return logger.namespaceAnsiColor;
		const assignedColor = colors[lastColorIndex++];
		if (lastColorIndex === colors.length) lastColorIndex = 0;
		logger.levelRoot.get(logger.namespaceTokens[0]).namespaceAnsiColor = assignedColor;
		return assignedColor;
	})();
	return `\u001b[3${ color < 8 ? color : `8;5;${ color }` };1m${ logger.namespace }\u001b[39;22m`;
};
