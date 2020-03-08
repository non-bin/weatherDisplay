'use strict';

// modules
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const mime = require('mime');

module.exports = http.createServer((req, res) => {
	if (req.url === '/api/radar') {
		const response = {};
		fs.readdir(path.join(__dirname, '../ui/img/radar/data'), (err, files) => {
			if (err) {
				throw err;
			}

			files.sort();

			response.images = files;

			res.setHeader('Content-Type', 'application/json');
			res.write(JSON.stringify(response));
			res.end(); // end the response
		});
	} else {
		const pathName = path.join(__dirname, '../ui', url.parse(req.url).pathname);
		fs.readFile(pathName, (err, data) => {
			if (err) {
				res.writeHead(404, {'Content-type': 'text/plan'});
				res.write('Page Was Not Found');
				res.end();
				// console.log(`Request to ${pathName} failed: NOT FOUND`);
			} else {
				res.setHeader('Content-Type', mime.getType(url.parse(req.url).pathname));
				res.write(data);
				res.end();
			}
		});
	}
});
