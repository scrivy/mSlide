'use strict';

var app = {};

document.addEventListener('DOMContentLoaded', initialize.bind(app));

function initialize() {
	var that = this;

	this.upload = document.getElementById('upload');
	this.place_id = document.getElementById('place_id');
	this.viewPics = document.getElementById('viewPics');
	this.allPics = document.getElementById('allPics');
	this.markers = {};

	this.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: new google.maps.LatLng(38.55, -121.74)
	});

	this.input = document.getElementById('input');
	this.input.nextElementSibling.onclick = function() { // clear button
		that.input.value = '';
	};
	this.autocomplete = new google.maps.places.Autocomplete(this.input);
	this.autocomplete.bindTo('bounds', this.map);

	google.maps.event.addListener(this.autocomplete, 'place_changed', function() {
	//	that.infowindow.close();
	//	that.marker.setVisible(false);
		var res = that.autocomplete.getPlace();
		if (!res.geometry) return;

		// create the marker if it doesn't exist
		var place;
		if (!that.markers[res.place_id]) {
			delete res.opening_hours;
			delete res.reviews;
			place = that.markers[res.place_id] = res;
			place.marker = new google.maps.Marker({
				map: that.map,
				anchorPoint: new google.maps.Point(0, -29)
			});
			place.infowindow = new google.maps.InfoWindow();
		} else {
			place = that.markers[res.place_id]
		}

		$.getJSON('ajax/restaurants.php', { place_id: place.place_id }, function (data) {
			var address = '';

			// **************************
		//	console.log(data);

			if (place.address_components) {
				address = [
					(place.address_components[0] && place.address_components[0].short_name || ''),
					(place.address_components[1] && place.address_components[1].short_name || ''),
					(place.address_components[2] && place.address_components[2].short_name || '')
				].join(' ');
			}

			var content = '<div><strong>' + place.name + '</strong><br>' + address + '<br><br>';

			if (!data.data) {
				that.pics = [];
				var toSend = $.extend(true, {}, place);
				delete toSend.infowindow;
				delete toSend.marker;
				$.post('ajax/restaurants.php', { data: JSON.stringify(toSend) });
			} else if (data.data.length) {
				that.pics = data.data;
				content += "<div class='ui labeled icon button' onclick=\"viewPics();\"><i class='film icon'></i>view ratings</div><br><br>";
			}

			content += "<div class='ui labeled icon button' onclick=\"rate('" + place.place_id + "');\"><i class='photo icon'></i>upload</div>";
			place.infowindow.setContent(content);
	    	place.infowindow.open(that.map, that.marker);
		});

		if (place.geometry.viewport) {
			that.map.fitBounds(place.geometry.viewport);
		} else {
			that.map.setCenter(place.geometry.location);
			that.map.setZoom(17);
		}

		place.marker.setIcon({
			url: place.icon,
			size: new google.maps.Size(71, 71),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 34),
			scaledSize: new google.maps.Size(35, 35)
		});

		place.marker.setPosition(place.geometry.location);
		place.marker.setVisible(true);
	});

	google.maps.event.addListener(this.map, 'tilesloaded', updateVisibleRestaurants.bind(this));
}

function rate(placeId) {
	app.upload.style.display = 'block';
	app.place_id.value = placeId;
}

function viewPics() {
	app.viewPics.style.display = 'block';
	var content = '';

	app.pics.forEach(function(pic) {
		content += 	"<img src='ajax/pic.php?picId=" + pic.id + "' style='width: 100%;'>" +
					"<div class='ui info message'><div class='header'>comment</div><p>" + pic.comment + "</p></div>";
	});

	app.allPics.innerHTML = content;
}

function updateVisibleRestaurants() {
	var bounds 	= this.map.getBounds(),
		sw 		= bounds.getSouthWest(),
		ne 		= bounds.getNorthEast(),
		that  	= this
	;

	$.getJSON(
		'ajax/restaurants.php',
		{
			bounds: JSON.stringify([
				[ sw.lng(), sw.lat() ],
				[ ne.lng(), ne.lat() ]
			])
		},
		function(json) {
			json.data.forEach(function(place) {
				if (!that.markers[place.place_id]) {
					that.markers[place.place_id] = place;
				}
			});
		}
	);
}