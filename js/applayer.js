/**
 * ownCloud - oslayer
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author shi <shi@example.com>
 * @copyright shi 2015
 */

(function ($, OCA) {

//	$(document).ready(function () {
//	});
	OCA.OwnLayer = OCA.OwnLayer || {};
	OCA.OwnLayer.open = function(lon, lat, zoom) {
// lat with string makes wrong value. parse both lon and lat for safety
 		zoom = zoom || 15;
		var lonlat = [parseFloat(lon), parseFloat(lat)];
		var coord3857 = ol.proj.transform(lonlat,'EPSG:4326', 'EPSG:3857');
		var nview = new ol.View({
			center: coord3857,
			zoom:zoom
		});
		var map = document.getElementById('OwnLayer');
		if(!map) {
			var c_body= document.getElementById('body-user');
			var map=document.createElement('DIV');
			map.id='OwnLayer';
			c_body.appendChild(map);
			var cl_div = document.createElement('DIV');
			cl_div.className='ol-control ol-custom-close ol-unselectable';
			var cl_btn = document.createElement('BUTTON');
			cl_div.appendChild(cl_btn);
//			cl_btn.value='close';
			btn_txt = document.createElement('SPAN');
			btn_txt.appendChild(document.createTextNode('X'))
			cl_btn.appendChild(btn_txt);
			cl_btn.addEventListener('click', this.close, false);
//			map.appendChild(cl_btn);
			
		}

		if(OCA.OwnLayer.Map) {
			OCA.OwnLayer.Map.setView(nview);
			map.style.display = '';
		} else {
		 	OCA.OwnLayer.Map = new ol.Map({
				view: nview,
				layers: [
					new ol.layer.Tile({
						name : 'Base layer by OSM',
						source: new ol.source.MapQuest({layer:'osm'})
						
					})
				],
				controls: [ 
					new ol.control.Attribution({
						collapsible: false
					}),
					new ol.control.Zoom(),
					new ol.control.ZoomSlider()
//					new ol.control.FullScreen()
				
				],
				target: map
			});
			var cls = new ol.control.Control({element: cl_div});
			cls.on('click', function(){//!doesnt work with no error
				this.close();
				console.log('Control clicked');
			}, null);
			OCA.OwnLayer.Map.addControl(cls);
		}
	};

	OCA.OwnLayer.close = function() {
		var map = document.getElementById('OwnLayer');
		if(map) {
			map.style.display = 'none';
		}
	}

	OCA.OwnLayer.plot = function(l_name, coord) {
		var lonlat = [parseFloat(coord.lon), parseFloat(coord.lat)];
		var coord3857 = ol.proj.transform(lonlat, 'EPSG:4326', 'EPSG:3857');
		var plot;
		layers = OCA.OwnLayer.Map.getLayers().forEach(function(l){
			console.log(l.get('name'));
			if(l.get('name')==='Picture Location'){
				plot = l;
			}
		});
		if (!plot) {
			plot = new ol.layer.Vector({
				name: 'Picture Location',
				source: new ol.source.Vector(),
				opacity: 0.75,
				visible: true
			});	
			OCA.OwnLayer.Map.addLayer(plot);
		}
		var s = plot.getSource();
		s.addFeature(new ol.Feature({
			geometry: new ol.geom.Point(coord3857),
			name: 'Pic1'
		}));
	}

})(jQuery, OCA);
