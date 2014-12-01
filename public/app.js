'use strict';

var app = {};

document.addEventListener('DOMContentLoaded', initialize.bind(app));

function initialize() {
	var that = this;

	this.upload = document.getElementById('upload');
	this.place_id = document.getElementById('place_id');
	this.viewPics = document.getElementById('viewPics');
	this.allPics = document.getElementById('allPics');

	this.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: new google.maps.LatLng(38.55, -121.74)
	});

	this.infowindow = new google.maps.InfoWindow();
	this.marker = new google.maps.Marker({
		map: this.map,
		anchorPoint: new google.maps.Point(0, -29)
	});

	this.input = document.getElementById('input');
	this.input.nextElementSibling.onclick = function() { // clear button
		that.input.value = '';
	};
	this.autocomplete = new google.maps.places.Autocomplete(this.input);
	this.autocomplete.bindTo('bounds', this.map);

	google.maps.event.addListener(this.autocomplete, 'place_changed', function() {
		that.infowindow.close();
		that.marker.setVisible(false);
		var place = that.autocomplete.getPlace();
		if (!place.geometry) return;

		//***************************
	//	console.log(place);

		$.getJSON('ajax/restaurants.php', { place_id: place.place_id }, function (data) {
			var address = '';

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
				delete place.opening_hours;
				delete place.reviews;
				$.post('ajax/restaurants.php', { data: JSON.stringify(place) });
			} else {
				that.pics = data.data;
				content += "<div class='ui labeled icon button' onclick=\"viewPics();\"><i class='film icon'></i>view ratings</div><br><br>";
			}

			content += "<div class='ui labeled icon button' onclick=\"rate('" + place.place_id + "');\"><i class='photo icon'></i>upload</div>";
			that.infowindow.setContent(content);
	    	that.infowindow.open(that.map, that.marker);
		});

		if (place.geometry.viewport) {
			that.map.fitBounds(place.geometry.viewport);
		} else {
			that.map.setCenter(place.geometry.location);
			that.map.setZoom(17);
		}

		that.marker.setIcon({
			url: place.icon,
			size: new google.maps.Size(71, 71),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 34),
			scaledSize: new google.maps.Size(35, 35)
		});

		that.marker.setPosition(place.geometry.location);
		that.marker.setVisible(true);
	});
}

function rate(placeId) {
	app.upload.style.display = 'block';
	app.place_id.value = placeId;
}

function viewPics() {
	app.viewPics.style.display = 'block';
	var content = '';

	app.pics.forEach(function(img) {
		content += "<img src='ajax/pic.php?picId=" + img + "' style='width: 100%;'><br>";
	});

	app.allPics.innerHTML = content;
}