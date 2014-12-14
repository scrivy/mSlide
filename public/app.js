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
		var place = that.markers[res.place_id] ?
			that.markers[res.place_id] : addMarker.call(that, res)
		;

		$.getJSON('ajax/restaurants.php', { place_id: place.place_id }, function (json) {
			if (!json.data) {
				var toSend = $.extend(true, {}, place);
				delete toSend.infowindow;
				delete toSend.marker;
				$.post('ajax/restaurants.php', { data: JSON.stringify(toSend) });
			}

			
		});

		if (place.geometry.viewport) {
			that.map.fitBounds(place.geometry.viewport);
		} else {
			that.map.setCenter(place.geometry.location);
			that.map.setZoom(17);
		}

		place.infowindow.open(that.map, place.marker);
	});

	google.maps.event.addListener(this.map, 'tilesloaded', checkBounds.bind(this));
}

function rate(placeId) {
	app.upload.style.display = 'block';
	app.place_id.value = placeId;
}

function viewPics(id) {
	var content = '';
	$.getJSON('ajax/restaurants.php', { place_id: id }, function (json) {
		json.data.forEach(function(pic) {
			content += 	"<img src='ajax/pic.php?picId=" + pic.id + "' style='width: 100%;'>" +
						"<div class='ui info message'><div class='header'>comment</div><p>" + pic.comment + "</p></div>";
		});

		app.allPics.innerHTML = content;
		app.viewPics.style.display = 'block';
	});
}

function checkBounds() {
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
			json.data.forEach(function(restaurant) {
				if (!that.markers[restaurant.place_id]) {
					addMarker.call(that, restaurant);
				} else { console.log('exists'); }
			});
		}
	);
}

function addMarker(res) {
	var that = this;

	delete res.opening_hours;
	delete res.reviews;
	this.markers[res.place_id] = res;
	res.marker = new google.maps.Marker({
		map: this.map,
		anchorPoint: new google.maps.Point(0, -29)
	});
	res.infowindow = new google.maps.InfoWindow();

	res.marker.setIcon({
		url: res.icon,
		size: new google.maps.Size(71, 71),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(17, 34),
		scaledSize: new google.maps.Size(35, 35)
	});

	if (res.location) {
		res.geometry = {
			location: {
				lat: res.location[1],
				lng: res.location[0]
			}
		}
	}

	res.marker.setPosition(res.geometry.location);

	var address = '';

	if (res.address_components) {
		address = [
			(res.address_components[0] && res.address_components[0].short_name || ''),
			(res.address_components[1] && res.address_components[1].short_name || ''),
			(res.address_components[2] && res.address_components[2].short_name || '')
		].join(' ');
	}

	var content = '<div><strong>' + res.name + '</strong><br>' + address + '<br><br>'
		+	"<div class='ui labeled icon button' onclick=\"viewPics('" + res.place_id + "');\"><i class='film icon'></i>view ratings</div><br><br>"
		+	"<div class='ui labeled icon button' onclick=\"rate('" + res.place_id + "');\"><i class='photo icon'></i>upload</div>"
	;

	res.infowindow.setContent(content);
	google.maps.event.addListener(res.marker, 'click', function() {
    	res.infowindow.open(that.map,res.marker);
  	});
//	res.marker.setVisible(true);

	return res;
}