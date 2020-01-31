'use strict';

// includes
const radarDownloader = require('./includes/radar.js');
const uiServer = require('./includes/uiServer');
const setup = require('./includes/setup.js');

// load config
const config = require('./config.js');

// setup the environment
setup();

// start the ui server
uiServer.listen(config.uiServer.port);
console.log(`[uiServer] Listening on *:${config.uiServer.port}`);

// update radar images every minute
radarDownloader.connect({host: 'ftp.bom.gov.au'});
setInterval(() => {
	radarDownloader.connect({host: 'ftp.bom.gov.au'});
}, config.radar.downloadInterval);
