/* eslint-disable no-unused-vars */
'use strict';

// update radar data
let radarApiData = {};
const radarState = {frame: 0};

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
}, 500);

const chart1 = new Chart('chart1', {
	type: 'line',
	data: {
		labels:   ['-12h', '-6h', '-3h', '-2h', '-1h', 'now'],
		datasets: [
			{
				label:           'Presure (hPa)',
				data:            [1, 2, 3, 4, 5, 6, 7, 8, 9],
				borderWidth:     1,
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
				],
			},
		],
	},
	options: {
		scales: {
			yAxes: [
				{ticks: {beginAtZero: true}},
			],
		},
	},
});

const chart2 = new Chart('chart2', {
	type: 'line',
	data: {
		labels:   ['-12h', '-6h', '-3h', '-2h', '-1h', 'now'],
		datasets: [
			{
				label:           'Presure (hPa)',
				data:            [1, 2, 3, 4, 5, 6, 7, 8, 9],
				borderWidth:     1,
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
				],
			},
		],
	},
	options: {
		scales: {
			yAxes: [
				{ticks: {beginAtZero: true}},
			],
		},
	},
});

const chart3 = new Chart('chart3', {
	type: 'line',
	data: {
		labels:   ['-12h', '-6h', '-3h', '-2h', '-1h', 'now'],
		datasets: [
			{
				label:           'Presure (hPa)',
				data:            [1, 2, 3, 4, 5, 6, 7, 8, 9],
				borderWidth:     1,
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
				],
			},
		],
	},
	options: {
		scales: {
			yAxes: [
				{ticks: {beginAtZero: true}},
			],
		},
	},
});
