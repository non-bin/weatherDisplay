/* eslint-disable no-unused-vars */
'use strict';

const radarUpdateInterval = findGetParameter('radarUpdateInterval') || 500;

// update radar data
let radarApiData = {};
const radarState = {frame: 0};

// update from the radar api
function updateRadarData() {
	const http = new XMLHttpRequest();
	const url = window.origin + '/api/radar';
	http.open('GET', url);
	http.send();

	http.onreadystatechange = (event) => {
		if (event.explicitOriginalTarget.readyState === 4 && event.explicitOriginalTarget.status === 200) {
			radarApiData = JSON.parse(http.responseText);
		}
	};
}
updateRadarData();
setInterval(() => {
	updateRadarData();
}, 60000);

// update the radar image
setInterval(() => {
	let imageName = '';
	radarState.frame++;
	if (radarState.frame > radarApiData.images.length) {
		radarState.frame = 0;
	}
	if (radarState.frame === radarApiData.images.length) {
		imageName = radarApiData.images[radarState.frame - 1];
	} else {
		imageName = radarApiData.images[radarState.frame];
	}

	document.getElementById('radarAnimation').src = './img/radar/data/' + imageName;
}, radarUpdateInterval);

// find the value of a get parameter
function findGetParameter(parameterName) {
	let result = null;
	let tmp = [];
	window.location.search.substr(1).split('&').forEach((item) => {
		tmp = item.split('=');
		if (tmp[0] === parameterName) {
			result = decodeURIComponent(tmp[1]);
		}
	});
	return result;
}
