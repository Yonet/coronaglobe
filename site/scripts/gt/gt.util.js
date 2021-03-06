import * as THREE from 'three';

const util = {
	// Convert a latitude/longitude pair to a 3D point
	latLongToVector3: function(lat, lon, radius) {
		var phi = (lon+90)*Math.PI/180; // Lon
		var theta = lat*Math.PI/180; // Lat

		var z = radius * Math.cos(phi) * Math.cos(theta); // Lon
		var x = radius * Math.sin(phi) * Math.cos(theta); // Lat
		var y = radius * Math.sin(theta);

		return new THREE.Vector3(x,y,z);
	},

	// Based on https://gist.github.com/nicoptere/2f2571db4b454bb18cd9
	vector3ToLatLong: function(vector3) {
		vector3.normalize();

		//longitude = angle of the vector around the Y axis
		//-( ) : negate to flip the longitude (3d space specific )
		//- PI to align with our texture
		var long = -(Math.atan2(-vector3.z, -vector3.x)) - Math.PI;

		//to bind between -PI / PI
		if (long < - Math.PI) {
			long += Math.PI * 2;
		}

		//latitude : angle between the vector & the vector projected on the XZ plane on a unit sphere
		//project on the XZ plane
		var p = new THREE.Vector3(vector3.x, 0, vector3.z);
		//project on the unit sphere
		p.normalize();

		//commpute the angle ( both vectors are normalized, no division by the sum of lengths )
		var lat = Math.acos(p.dot(vector3));

		//invert if Y is negative to ensure the latitude is comprised between -PI/2 & PI / 2
		if (vector3.y < 0) {
			lat *= -1;
		}

		return [util.rad2deg(long), util.rad2deg(lat)];
	},

	// Convert a latitude/longitude pair to a X/Y coordiante pair
	// Via https://stackoverflow.com/a/4565555
	latLongTo2dCoordinate: function(latitude, longitude, mapWidth, mapHeight) {
		var pos = {
			x: (mapWidth/360.0) * (180 + longitude),
			y: (mapHeight/180.0) * (90 - latitude)
		};

		if (isNaN(pos.y) || isNaN(pos.x)) {
			throw new Error('Failed to calculate position for '+latitude+','+longitude);
		}

		return pos;
	},

	rad2deg: function(rad) {
		return rad * 180 / Math.PI;
	},

	deg2rad: function(deg) {
		return deg * Math.PI / 180;
	},

	// Get the fractional day of the year for a given date
	// Use the current date if no date provided
	getDOY: function(date) {
		date = date || new Date();
		return date.getTime()/1000/60/60/24 % 365;
	},

	getHashArgs: function() {
		var args = {};
		var argString = window.location.hash.replace(/^#/, '');
		var argPairs = argString.split('&');
		argPairs.forEach(function(argPair) {
			var argParts = argPair.split('=');
			args[argParts[0]] = argParts[1];
		});

		return args;
	},

	setHashFromArgs: function(args) {
		var hash = '#';
		var count = 0;
		for (var arg in args) {
			var value = args[arg];
			if (!value) {
				continue;
			}

			if (count > 0) {
				hash += '&';
			}

			hash += `${arg}=${value}`;

			count++;
		}

		history.replaceState(null, null, hash);
	},

	getRatio(fractional, total) {
		if (fractional === 0) {
			return '-';
		}
		return `1 : ${Math.round(total / fractional).toLocaleString()}`;
	},

	extend: function() {
		var objs = arguments;
		var result = objs[0];
		for (var i = 1; i < objs.length; i++) {
			var obj = objs[i];
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop) && obj[prop] !== undefined)
					result[prop] = obj[prop];
			}
		}
		return result;
	},

	round: function(number, factor) {
		return Math.round(number * factor) / factor;
	},

	getDateAsYYYYDDMM: function(dateString) {
		let parts = dateString.split('-');
		let newDate = parts.map(part => String(part).padStart(2, '0')).join('-');
		return newDate;
	},

	getDateFromInputString: function(dateString) {
		return new Date(this.getDateAsYYYYDDMM(dateString) + 'T12:00:00');
	},

	getDateFromDatasetString: function(dateString) {
		return new Date(this.getDateAsYYYYDDMM(dateString));
	},

	formatDateForDataset: function(dateString) {
		let date = util.getDateFromInputString(dateString);
		return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() - 2000}`;
	},

	formatDateForInput: function(dateString) {
		return util.getDateFromDatasetString(dateString).toISOString().split("T")[0];
	},

	getColorOnGradient: function(colors, position) {
		if (position === 1) {
			return colors[colors.length - 1].clone();
		}
		if (position === 0) {
			return colors[0].clone();
		}

		let index = Math.floor(position * (colors.length - 1));
		let startColor = colors[index];
		let endColor = colors[index + 1];
		let alpha = position * (colors.length - 1) - index;
		return startColor.clone().lerp(endColor, alpha);
	},

	// Via https://math.stackexchange.com/a/57510
	adjustTanh: function(value, a = 0.1, b = 1.75) {
		return Math.min(Math.tanh(value + a) * b, 1);
	}
};

export default util;
