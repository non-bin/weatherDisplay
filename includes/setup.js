'use strict';

// modules
const fs = require('fs');
const path = require('path');

module.exports = function setup() {
	if (!fs.existsSync(path.join(__dirname, '../ui/img/radar/data'))) {
		fs.mkdirSync(path.join(__dirname, '../ui/img/radar/data'));
		console.log('[setup] Created radar data images folder');
	}
};
