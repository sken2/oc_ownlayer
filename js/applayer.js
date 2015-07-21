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
	OCA.OwnLayer.open = function(coord, zoom) {
// lat with string makes wrong value. parse both lon and lat for safety
 		zoom = zoom || 15;
console.log(coord);
		var coord = [parseFloat(coord[0]), parseFloat(coord[1])];
		var coord3857 = ol.proj.transform(coord,'EPSG:4326', 'EPSG:3857');
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
			btn_txt = document.createElement('SPAN');
			btn_txt.appendChild(document.createTextNode('X'))
			cl_btn.appendChild(btn_txt);
			cl_btn.addEventListener('click', this.close, false);
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
					new ol.control.ZoomSlider(),
					new ol.control.OverviewMap(),
//					new ol.control.FullScreen(),
				],
				target: map
			});
			var cls = new ol.control.Control({element: cl_div});
			cls.on('click', function(){
				this.close();
			}, null);
			OCA.OwnLayer.Map.addControl(cls);
			OCA.OwnLayer.Map.on('change', layerlist);
		}
	};

	OCA.OwnLayer.close = function() {
		var map = document.getElementById('OwnLayer');
		if(map) {
			map.style.display = 'none';
		}
	}

	OCA.OwnLayer.plot = function(l_name, points) {
		var plot;
		layers = OCA.OwnLayer.Map.getLayers().forEach(function(l){
			if(l.get('name')===l_name){
				plot = l;
			}
		});
		if (!plot) {
			plot = new ol.layer.Vector({
				name: l_name,
				source: new ol.source.Vector(),
				opacity: 0.75,
				visible: true
			});	
			OCA.OwnLayer.Map.addLayer(plot);
		}
		var s = plot.getSource();
		points.coordinates.forEach(function(p){
			var coord = ol.proj.transform(
				[parseFloat(p[0]), parseFloat(p[1])],
				'EPSG:4326',
				'EPSG:3857'
			);
			s.addFeature(new ol.Feature({
				geometry: new ol.geom.Point(coord),
				name: 'Pic1'
			}));
		});
		fireEvent.call(OCA.OwnLayer.Map, 'change');
	}

	function layerlist() {
		var listbox = document.createElement('DIV');
		listbox.className='ol-control ol-custom-llist ol-unselectable';
	
		this.getLayers().forEach(function(l) {
			var l_span = document.createElement('SPAN');
			var vis_chk = document.createElement('INPUT');
			vis_chk.type = 'checkbox';
			vis_chk.checked = l.getVisible();
			vis_chk.addEventListener('change', function(){
				l.setVisible(this.checked);
			}, false);
			listbox.appendChild(l_span);
			l_span.appendChild(vis_chk);
			l_span.appendChild(document.createTextNode(l.get('name')));
		});
		if(OCA.OwnLayer.layerlist) {
			OCA.OwnLayer.Map.removeControl(OCA.OwnLayer.layerlist);
		}
		OCA.OwnLayer.layerlist = new ol.control.Control({element: listbox});
		OCA.OwnLayer.Map.addControl(OCA.OwnLayer.layerlist);
	};
	function fireEvent(type) {
		ev = new Event(type, {"bubbles":true, "cancelable":false});
		this.dispatchEvent(ev);
	}

})(jQuery, OCA);
