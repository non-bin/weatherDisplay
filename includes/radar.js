'use strict';

// modules
const FTPClient = require('ftp');
const fs = require('fs');
const path = require('path');

// load config
const config = require(path.join(__dirname, '../config.js'));

module.exports = new FTPClient();
module.exports.on('ready', () => {
	console.log('[radarDownloader] Downloading new radar images...');
	// cd to radar images folder
	module.exports.cwd('/anon/gen/radar/', (err, cd) => {
		if (err) {
			throw err;
		}

		// if the server sent a current directory, and it's not what we expect
		if (typeof cd !== 'undefined' && cd !== '/anon/gen/radar/') {
			throw new Error(`Failed to get radar images. Failed to cd to '/anon/gen/radar/', ended up in ${cd}`);
		}

		// read the list of files in the directory, filtering for what we want
		module.exports.list('./IDR023.T.*', (err, list) => {
			if (err) {
				throw err;
			}

			// find out what images we have
			fs.readdir(path.join(__dirname, '../ui/img/radar/data'), (err, files) => {
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
					module.exports.get(filenameToDownload, (err, stream) => {
						if (err) {
							throw err;
						}

						// when we finish, resolve the promise
						stream.once('close', () => {
							promise.resolve();
						});

						// download the file
						stream.pipe(fs.createWriteStream(path.join(__dirname, '../ui/img/radar/data', filenameToDownload)));
					});
				}

				// when all downloads have finished
				Promise.all(downloadPromises).then(() => {
					// close the ftp connection
					module.exports.end();

					// delete any old files
					fs.readdir(path.join(__dirname, '../ui/img/radar/data'), (err, files) => {
						if (err) {
							throw err;
						}

						files.sort();

						// console.log(files);

						// only keep as many as we need
						while (files.length > config.radar.imagesToKeep) {
							// delete the oldest file from disk and the array
							fs.unlink(path.join(__dirname, '../ui/img/radar/data', files.shift()), () => {});
						}

						if (downloadList.length > 0) {
							console.log(`[radarDownloader] Got ${downloadList.length} new images`);
						} else {
							console.log('[radarDownloader] No new images');
						}
					});
				});
			});
		});
	});
});
