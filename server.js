'use strict';

const FTPClient = require('ftp');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const mime = require('mime');

const config = require(path.join(__dirname, 'config.js'));

const radarDownloader = new FTPClient();
radarDownloader.on('ready', () => {
	console.log('Downloading new radar images...');
	// cd to radar images folder
	radarDownloader.cwd('/anon/gen/radar/', (err, cd) => {
		if (err) {
			throw err;
		}

		// if the server sent a current directory, and it's not what we expect
		if (typeof cd !== 'undefined' && cd !== '/anon/gen/radar/') {
			throw new Error(`Failed to get radar images. Failed to cd to '/anon/gen/radar/', ended up in ${cd}`);
		}

		// read the list of files in the directory, filtering for what we want
		radarDownloader.list('./IDR023.T.*', (err, list) => {
			if (err) {
				throw err;
			}

			// find out what images we have
			fs.readdir(path.join(__dirname, 'ui', 'img', 'radar', 'data'), (err, files) => {
				if (err) {
					throw err;
				}

				// find the datestamp of the latest downloaded image
				const datestamps = [];
				for (let i = 0; i < files.length; i++) {
					const name = files[i];

					datestamps.push(name.substring(10, 21));
				}
				const latestDatestamp = Math.max(...datestamps);

				// create a list of new available file names
				const downloadList = [];
				for (let i = 0; i < list.length; i++) {
					const file = list[i];

					if (Number(file.name.substring(10, 21)) > latestDatestamp) {
						downloadList.push(file.name);
					}
				}
				// and limit it according to config
				downloadList.sort();
				downloadList.splice(0, downloadList.length - config.radar.imagesToKeep);

				const downloadPromises = [];
				for (let i = 0; i < downloadList.length; i++) {
					const filenameToDownload = downloadList[i];

					// create a promise for each file
					const promise = {};
					downloadPromises.push(new Promise((resolve, reject) => {
						promise.resolve = resolve;
						promise.reject = reject;
					}));

					downloadPromises.push(promise);

					// download a file from the list
					radarDownloader.get(filenameToDownload, (err, stream) => {
						if (err) {
							throw err;
						}

						// when we finish, resolve the promise
						stream.once('close', () => {
							promise.resolve();
						});

						// download the file
						stream.pipe(fs.createWriteStream(path.join(__dirname, 'ui', 'img', 'radar', 'data', filenameToDownload)));
					});
				}

				// when all downloads have finished
				Promise.all(downloadPromises).then(() => {
					// close the ftp connection
					radarDownloader.end();

					// delete any old files
					fs.readdir(path.join(__dirname, 'ui', 'img', 'radar', 'data'), (err, files) => {
						if (err) {
							throw err;
						}

						files.sort();

						// console.log(files);

						// only keep as many as we need
						while (files.length > config.radar.imagesToKeep) {
							// delete the oldest file from disk and the array
							fs.unlink(path.join(__dirname, 'ui', 'img', 'radar', 'data', files.shift()), () => {});
						}

						if (downloadList.length > 0) {
							console.log(`Got ${downloadList.length} new images`);
						} else {
							console.log('No new images');
						}
					});
				});
			});
		});
	});
});

// start the ui server
http.createServer((req, res) => {
	if (req.url === '/api/radar') {
		const response = {};
		fs.readdir(path.join(__dirname, 'ui', 'img', 'radar', 'data'), (err, files) => {
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
		const pathName = path.join(__dirname, url.parse(req.url).pathname);
		fs.readFile(pathName, (err, data) => {
			if (err) {
				res.writeHead(404, {'Content-type': 'text/plan'});
				res.write('Page Was Not Found');
				res.end();
				console.log(`Request to ${pathName} failed: NOT FOUND`);
			} else {
				res.setHeader('Content-Type', mime.getType(url.parse(req.url).pathname));
				res.write(data);
				res.end();
				console.log(`Request to ${pathName} succeeded`);
			}
		});
	}
}).listen(8080);

// update radar images every minute
radarDownloader.connect({host: 'ftp.bom.gov.au'});
setInterval(() => {
	radarDownloader.connect({host: 'ftp.bom.gov.au'});
}, config.radar.downloadInterval);
