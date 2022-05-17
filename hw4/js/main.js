import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import {OBJLoader} from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/MTLLoader.js";
import {Steve} from './steve.js';

function clamp (val, min, max) { // min <= val <= max
   return Math.min(Math.max(val,min),max);
}

class Agent {
  constructor(pos, group) {
    this.pos = pos.clone();
    this.vel = new THREE.Vector3();
    this.force = new THREE.Vector3();
    this.target = null;
    this.size = 3;
    this.model = group;
    scene.add (group);
    
    this.MAXSPEED = 60;
    this.ARRIVAL_R = 30;
		
    // for orientable agent
  }
  
  update(dt) {
    this.accumulateForce();
    this.vel.add(this.force.clone().multiplyScalar(dt));
		// ARRIVAL: velocity modulation
    if (this.target !== null) {   
      let dst = this.target.distanceTo(this.pos);
      if (dst < this.ARRIVAL_R) {  // close enough
        this.vel.setLength(dst);
      }
    }
    
   	// MAXSPEED modulation
		let speed = this.vel.length()
		this.vel.setLength(clamp (speed, 0, this.MAXSPEED))
		this.pos.add(this.vel.clone().multiplyScalar(dt))
        this.model.position.copy(this.pos)
    
    // for orientable agent
    // non PD version
    if (this.vel.length() > 0.1) {
	    	this.angle = Math.atan2 (-this.vel.z, this.vel.x)
    		this.model.rotation.z = this.angle
   	}
  }
  
  setTarget(x,y,z) {
  	if (this.target !== null)
    	this.target.set(x,y,z);
    else {
    	this.target = new THREE.Vector3(x,y,z);
    }
  }
  
  targetInducedForce(targetPos) { // seek
    return targetPos.clone().sub(this.pos).setLength(this.MAXSPEED).sub(this.vel);
  }

  accumulateForce() {
    if (this.target) 
    	this.force.copy(this.targetInducedForce(this.target));
  }

}

var camera, scene, renderer;
const WW = 4; // see notes p.10-11, p.18
const HH = 12;
var texture;
var theta=0;
var R=50;
var gyro;
var temp=0;
var object;
var bus;
var raycaster;
var mouse = new THREE.Vector2();
var pickables = [];
var agent;
var count=0;
var steve,targetMesh;
var clock = new THREE.Clock();



function init() {
   
  scene = new THREE.Scene();
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x888888);
  document.body.appendChild(renderer.domElement);

  
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 120;
  camera.position.y = 100;
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableKeys = false;
  
  //scene.add(camera2);
   var loader = new THREE.TextureLoader();
	loader.setCrossOrigin('');
    texture = loader.load('https://i.imgur.com/dSQ0A9W.png');
  ////////////////////////////////////////////////////////////////
  var gridXZ = new THREE.GridHelper(1000, 200, 'red', 'white');
  scene.add(gridXZ);
  
  steve=new Steve(4,12);
  steve.buildsteve();
  
  raycaster = new THREE.Raycaster();
  document.addEventListener('pointerdown', onDocumentMouseDown, false);
	
	let plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    visible: true
  }));
  scene.add(plane);
  plane.material.visible = false
  plane.rotation.x = -Math.PI / 2;
  pickables = [plane];
	
	let loader2 = new THREE.TextureLoader();
  let tex = loader2.load ("https://i.imgur.com/GmthNU8.png");
  targetMesh = new THREE.Mesh(new THREE.CircleGeometry(10,20), new THREE.MeshBasicMaterial({
    map: tex,
    transparent:true
	 }));
  scene.add(targetMesh);
  targetMesh.rotation.x = -Math.PI/2
  
  readModel('bus');
  var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
 
}


function animate() {
  var dt = clock.getDelta();
  if(bus != undefined)
  {  
    if(count==0){
     agent = new Agent(new THREE.Vector3(0,16,-30),bus);
	 count=1;
	 }
	 steve.update(dt); 
     agent.update(dt);
  }
  
  render();
  requestAnimationFrame(animate);

}

function readModel (modelName, targetSize=100) {

  var onProgress = function(xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  var onError = function(xhr) {};

  var mtlLoader = new MTLLoader();
  mtlLoader.setPath('models/');
  mtlLoader.load(modelName+'.mtl', function(materials) {

    materials.preload();

    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('models/');
    objLoader.load(modelName+'.obj', function(object) {
		
		bus =  unitize (object, targetSize);
		//theObject.add ( new THREE.BoxHelper (theObject) )
		bus.name = 'OBJ'
		scene.add (bus);

		
		bus.setRotationFromEuler (new THREE.Euler (3.1416/2, 0, -3.1416/2, 'ZYX'))
		bus.rotation.x += -Math.PI;
		bus.rotation.y += Math.PI/2;	
		
    }, onProgress, onError);

  });

}

function unitize (object, targetSize) {  

	
	// find bounding box of 'object'
	var box3 = new THREE.Box3();
	box3.setFromObject (object);
	var size = new THREE.Vector3();
	size.subVectors (box3.max, box3.min);
	var center = new THREE.Vector3();
	center.addVectors(box3.max, box3.min).multiplyScalar (0.5);
	
	console.log ('center: ' + center.x + ', '+center.y + ', '+center.z );
	console.log ('size: ' + size.x + ', ' +  size.y + ', '+size.z );
	
	// uniform scaling according to objSize
	var objSize = Math.max (size.x, size.y, size.z);
	var scaleSet = targetSize/objSize;
				
	var theObject =  new THREE.Object3D();
	theObject.add (object);
	object.scale.set (scaleSet, scaleSet, scaleSet);
	object.position.set (-center.x*scaleSet, -center.y*scaleSet, -center.z*scaleSet);
	
	return theObject;
			
} 

function onDocumentMouseDown(event) {
   
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // find intersections
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(pickables);
  if (intersects.length > 0) {
    targetMesh.position.copy(intersects[0].point);
    targetMesh.position.y = 0.15
    agent.setTarget(intersects[0].point.x,16, intersects[0].point.z);
  }

}

function render() {
  renderer.render(scene, camera);
}

export{scene,camera,texture,init,animate,Agent,agent}