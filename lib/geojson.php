<?php
/**
 * geoJSON.php
 */
namespace OCA\OwnLayer\Lib;

use JsonSerializable;
use OCP\AppFramework\Db\Entity;

class GeoJSON extends Entity implements JsonSerializable {

//	const types = array('Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon','GeometryCollection');

	private $type;
	private $container = array() ;
	
	private $properties;
	private $crs;
	private $bbox;

	public function __construct ($type, $params, $props = null,  $crs = null, $bbox = null) {

		switch ($type){
		case 'Feature':
			$this->container = $params;
			break;
		case 'Point':
			$this->container = $this->geometry($params);
			break;
		case 'LineString':
			$this->container = $this->geometry_array($params);
			break;
		case 'Polygon':
			$this->container = $this->geometry_a_a($params);
			break;
		case 'MultiPoint':
			$this->container = $this->geometry_array($params);
			break;
		case 'MultiLineString':
			$this->container = $this->geometry_a_a($params);
			break;
		case 'MultiPolygon':
			$this->container = $this->geometry_a_a_a($params);
			break;
		case 'GeometryCollection':
			$this->container = $params;
			break;
		case 'FeatureCollection':
			$this->container = $params;
			break;
		default:
			throw new \Exception('oops');
		}
		$this->type = $type;
		$this->properties = $props;
		$this->crs = $crs;
		$this->bbox = $bbox;
	}

	public function setProperties($props) {
		//! have to check $prop is array or Object
		$this->propetries = $prop;
	}
	public function setBbox($bbox = null) {
		if (!$bbox  or !is_array($bbox) or empty($bbox) ) {
			$bbox = $this->calcBbox();
		}
		$this->bbox = $bbox;
	}

	public function jsonSerialize(){
		$res = array() ;
		$res['type'] = $this->type;
		if($this->crs) {
			$res['crs'] = $this->crs->jsonSerialize();
		}
		if($this->bbox){
			$res['bbox'] = $this->bbox;
		}
		switch ($this->type) {
		case 'Feature':
			$res['geometry'] = $this->container->jsonSerialize();
			break;

		case 'FeatureCollection':
			$fc = array();
			foreach($this->container as $feature){
				$fc[] = $feature->jsonSerialize();
			}
			$res['features'] = $fc;
			break;

		case 'GeometryCollection':
			$gc = array();
			foreach($this->container as $feature){
				$gc[] = $feature->jsonSerialize();
			}
			$res['features'] = $fc;
			break;
		
		default:
			$res['coordinates'] = $this->container;		
		}
		return $res;
	}

	protected function geometry($params){
		if(is_array($params)) {
			return $params;
		}
	}
	protected function geometry_array($params) {
		$dim = sizeof(reset($params));

		foreach($params as $coordinate) {
			if($dim !== sizeof($coordinate)){
				throw new \Exception('oops');
			}
		}
		return $params;
	}
	protected function geometry_a_a($params){
		$dim = sizeof(reset(reset($params)));

		foreach($params as $c_array) {
			foreach($c_array as $coordinate) {
				if($dim !== sizeof($coordinate)){
					throw new \Exception('oops');
				}
			}
		}
		return $params;
	}
	protected function geometry_a_a_a($params){
		$dim = sizeof(reset(reset(reset($params))));

		foreach($params as $c_a_a) {
			foreach($c_a_a as $c_a) {
				foreach ($c_a as $coordinate) {
					if($dim !== sizeof($coordinate)){
						throw new \Exception('oops');
					}
				}
			}
		}
		return $params;
	}

	protected function calcBbox($here = null, $bb = array()) {
		if(!$here) {
			$here = $this->container;
		}
		$first = reset($here);
		foreach ($here as $geo) {
			if(is_array($geo[0])) {
				$bb = $this->calcBbox($geo, $bb) ;
			} else {
				if(empty($bb)) {
					$bb = array_slice($geo, 0, 2);
				} else {
					$bb[0] = min($geo[0], $bb[0]);	
					$bb[1] = min($geo[1], $bb[1]);	
					$bb[2] = max($geo[2], $bb[2]);	
					$bb[3] = max($geo[3], $bb[3]);	
				}
			}
		}
		return $bb;
	}
}
