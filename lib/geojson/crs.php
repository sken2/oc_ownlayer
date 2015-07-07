<?php
namespace OCA\OwnLayer\Lib\GeoJSON;

//use jsonSerializable;
use OCP\AppFramework\Db\Entity;

class Crs extends Entity implements \jsonSerializable {

	private $type;
	private $param;

	public function __construct($type, $param) {
		switch($type){
		case 'name':
			if(!is_string($param)){
				throw new Exception('oops');
			}
			break;
		case 'link':
			if(!is_array($param)){
				throw new Exception('oops');
			}
			break;
		default:
			throw new Exception('oops');
		}
		$this->type = $type;
		$this->param = $param;
	}

	public function jsonSerialize(){
		$r = array();

		$r['type'] = $this->type;
		if($this->type === 'link') {
			if($isset($this->param['href']) && isset($this->param['type'])){
				$r['properties'] = array(
					'href'=> $this->param['href'],
					'type'=> $this->param['type'],
				);
			} else {
				$r['properties'] = array(
					'href' => reset($this->param),
					'type' => next($this->param),
				);
			}
		} else {// otherwise type='name'
			$r['properties'] = array(
				'name' => $this->param,
			);
		}
		return $r;
	}
}
