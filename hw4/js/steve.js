import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import {scene,texture,Agent,agent} from './main.js';

function clamp (val, min, max) { // min <= val <= max
   return Math.min(Math.max(val,min),max);
}
var T=2;
var clock = new THREE.Clock();
var ts = clock.getElapsedTime();

class Steve{
   constructor(WW,HH){
     this.WW=WW;
	 this.HH=HH;
     this.pos=new THREE.Vector3(0,12,0);
     this.vel=new THREE.Vector3(0,0,0);
     this.force=new THREE.Vector3(0,0,0);
     this.power=0.1;
     this.angle=0;	 
	 this.target=null;
	 
	 this.pose1={
	 lThigh: Math.PI/80*this.vel.length(),
     rThigh: -Math.PI/80*this.vel.length()
}
     this.pose2 = {
	 lThigh: -Math.PI/80*this.vel.length(),
     rThigh: Math.PI/80*this.vel.length()
}
     this.keys = [
  [0, this.pose1],
  [0.5, this.pose2],
  [1, this.pose1]
];
	 
	 this.MAXSPEED = 30;
     this.ARRIVAL_R = 30;
   }

  buildsteve(){
   this.head = this.buildHead(8,8,8);
   this.torso = this.buildTorso(8,12,4);
   this.torso.add (this.head);
   this.head.position.y = this.HH;
   this.torso.position.set (0, this.HH, 0);
  
   this.lArm = this.buildLArm(4,12,4);
   this.torso.add (this.lArm);
   this.lArm.position.set (0, this.HH, -(this.WW+this.WW/2));

   this.lLeg = this.buildLLeg(4,12,4);
   this.torso.add (this.lLeg);
   this.lLeg.position.set (0, 0, -this.WW/2);
  
   this.rLeg =this.buildRLeg(4,12,4);
   this.torso.add (this.rLeg);
   this.rLeg.position.set (0,0,this.WW/2);
  
   this.rArm = this.buildRArm(4,12,4);
   this.torso.add (this.rArm);
   this.rArm.position.set (0, this.HH, this.WW+this.WW/2);
  
  //head.rotation.y = Math.PI/6;
 // lArm.rotation.x = -Math.PI/6;
  //rArm.rotation.x = Math.PI/6;
  
   this.lLeg.rotation.z = Math.PI/6;
   this.rLeg.rotation.z =-Math.PI/6;
   
   scene.add (this.torso);

}
  update(dt){
    this.setTarget (agent.model.position.x,12,agent.model.position.z);
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
        this.torso.position.copy(this.pos)

    
    // for orientable agent
    // non PD version
    if (this.vel.length() > 0.1) {
	    	this.angle = Math.atan2 (-this.vel.z, this.vel.x)
    		this.torso.rotation.y = this.angle
			let intKey=this.keyframe(clock.getElapsedTime());
                this.lArm.rotation.z = intKey[1];
                this.rArm.rotation.z = intKey[0];
                this.lLeg.rotation.z = intKey[0];
                this.rLeg.rotation.z = intKey[1];
   	}
	    this.pose1.lThigh = -Math.PI/80* this.vel.length();
		this.pose1.rThigh = Math.PI/80 * this.vel.length();
		this.pose2.lThigh = Math.PI/80 * this.vel.length();
		this.pose2.rThigh = -Math.PI/80* this.vel.length();
	  
	  
   
   }
  keyframe(t){
  var s = ((t - ts) % T) / T;

  for (var i = 1; i < this.keys.length; i++) {
    if (this.keys[i][0] > s) break;
  }
  // take i-1
  var ii = i - 1;
  var a = (s - this.keys[ii][0]) / (this.keys[ii + 1][0] - this.keys[ii][0]);
  let intKey = [this.keys[ii][1].lThigh * (1 - a) + this.keys[ii + 1][1].lThigh * a,
            this.keys[ii][1].rThigh * (1 - a) + this.keys[ii + 1][1].rThigh * a
  ];
	return intKey;
}   
   
 buildHead(WW, HH, DD) {
 let head = new THREE.Group();
  var geometry = new THREE.BufferGeometry();	
  var vertices = [];
  var indices = [];
	var uvs = [];

	////////////
  const ww = 1;
  const hh = 3;
  const UU = 14*ww;
  const VV = hh + 5*ww;
  
	var a = {u: 2*ww, v: hh+5*ww};
  var b = {u: 4*ww, v: hh+5*ww};
  var c = {u: 6*ww, v: hh+5*ww};
  var d = {u: 0, v: hh+3*ww};
  var e = {u: 2*ww, v: hh+3*ww};
  var f = {u: 4*ww, v: hh+3*ww};
  var g = {u: 6*ww, v: hh+3*ww};
  var h = {u: 8*ww, v: hh+3*ww};
  var i = {u: 0, v: hh+ww};
  var j = {u: 2*ww, v: hh+ww};
  var k = {u: 4*ww, v: hh+ww};
  var l = {u: 6*ww, v: hh+ww};
  var m = {u: 8*ww, v: hh+ww};

  // PZ
  vertices.push(-WW/2,HH/2,DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,HH/2,DD/2 ); // 0,3,2,1
  indices.push(0,1,2, 0,2,3);
	uvs.push (d.u/UU,d.v/VV, i.u/UU,i.v/VV, j.u/UU,j.v/VV, e.u/UU,e.v/VV); //  d,i,j,e
	// PX
  vertices.push(WW/2,HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2, WW/2,HH/2,-DD/2 ); // 1,2,6,5
  indices.push (4,5,6, 4,6,7); // [0,1,2, 0,2,3] + 4
	uvs.push (e.u/UU,e.v/VV, j.u/UU,j.v/VV, k.u/UU,k.v/VV, f.u/UU,f.v/VV); //  e,j,k,f
	// NX
  vertices.push(-WW/2,HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, -WW/2,HH/2,DD/2 ); // 4,7,3,0
  indices.push (8,9,10, 8,10,11); // [0,1,2, 0,2,3] + 8
	uvs.push (g.u/UU,g.v/VV, l.u/UU,l.v/VV, m.u/UU,m.v/VV, h.u/UU,h.v/VV); //  g,l,m,h
	// NZ
  vertices.push(WW/2,HH/2,-DD/2, WW/2,-HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,HH/2,-DD/2 ); // 5,6,7,4
  indices.push (12,13,14, 12,14,15); // [0,1,2, 0,2,3] + 12
	uvs.push (f.u/UU,f.v/VV, k.u/UU,k.v/VV, l.u/UU,l.v/VV, g.u/UU,g.v/VV); // f,k,l,g
	
	vertices.push(-WW/2,HH/2,-DD/2, -WW/2,HH/2,DD/2, WW/2,HH/2,DD/2, WW/2,HH/2,-DD/2 ); // 4,0,1,5
  indices.push (16,17,18, 16,18,19); // [0,1,2, 0,2,3] + 16
	uvs.push (a.u/UU,a.v/VV, e.u/UU,e.v/VV, f.u/UU,f.v/VV, b.u/UU,b.v/VV); // a,e,f,b
	
	vertices.push(-WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2 ); // 7,3,2,6
  indices.push (20,21,22, 20,22,23); // [0,1,2, 0,2,3] + 20
	uvs.push (b.u/UU,b.v/VV, f.u/UU,f.v/VV, g.u/UU,g.v/VV, c.u/UU,c.v/VV); // b,f,g,c
	geometry.setIndex(indices);  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));	
  let mesh = new THREE.Mesh (geometry, new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide}));
  head.add (mesh);
  mesh.position.y = WW/2;
  return head;
}

 buildLArm(WW,HH,DD) {
	let lArm = new THREE.Group();
  var geometry = new THREE.BufferGeometry();	
  var vertices = [];
  var indices = [];
	var uvs = [];

  const ww = 1;
  const hh = 3;
	const UU = 14*ww;
  const VV = hh + 5*ww;
  
  var a = {u: 11*ww, v:hh+ww};
  var b = {u: 12*ww, v:hh+ww};
  var c = {u: 13*ww, v:hh+ww};
  var d = {u: 10*ww, v:hh};
  var e = {u: 11*ww, v:hh};
  var f = {u: 12*ww, v:hh};
  var g = {u: 13*ww, v:hh};
  var h = {u: 14*ww, v:hh};
  var i = {u: 10*ww, v:0};
  var j = {u: 11*ww, v:0};
  var k = {u: 12*ww, v:0};
  var l = {u: 13*ww, v:0};
  var m = {u: 14*ww, v:0};

	 // PZ
  vertices.push(-WW/2,HH/2,DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,HH/2,DD/2 ); // 0,3,2,1
  indices.push(0,1,2, 0,2,3);
	uvs.push (d.u/UU,d.v/VV, i.u/UU,i.v/VV, j.u/UU,j.v/VV, e.u/UU,e.v/VV); //  d,i,j,e
	// PX
  vertices.push(WW/2,HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2, WW/2,HH/2,-DD/2 ); // 1,2,6,5
  indices.push (4,5,6, 4,6,7); // [0,1,2, 0,2,3] + 4
	uvs.push (e.u/UU,e.v/VV, j.u/UU,j.v/VV, k.u/UU,k.v/VV, f.u/UU,f.v/VV); //  e,j,k,f
	// NX
  vertices.push(-WW/2,HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, -WW/2,HH/2,DD/2 ); // 4,7,3,0
  indices.push (8,9,10, 8,10,11); // [0,1,2, 0,2,3] + 8
	uvs.push (g.u/UU,g.v/VV, l.u/UU,l.v/VV, m.u/UU,m.v/VV, h.u/UU,h.v/VV); //  g,l,m,h
	// NZ
  vertices.push(WW/2,HH/2,-DD/2, WW/2,-HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,HH/2,-DD/2 ); // 5,6,7,4
  indices.push (12,13,14, 12,14,15); // [0,1,2, 0,2,3] + 12
	uvs.push (f.u/UU,f.v/VV, k.u/UU,k.v/VV, l.u/UU,l.v/VV, g.u/UU,g.v/VV); // f,k,l,g
	
	vertices.push(-WW/2,HH/2,-DD/2, -WW/2,HH/2,DD/2, WW/2,HH/2,DD/2, WW/2,HH/2,-DD/2 ); // 4,0,1,5
  indices.push (16,17,18, 16,18,19); // [0,1,2, 0,2,3] + 16
	uvs.push (a.u/UU,a.v/VV, e.u/UU,e.v/VV, f.u/UU,f.v/VV, b.u/UU,b.v/VV); // a,e,f,b
	
	vertices.push(-WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2 ); // 7,3,2,6
  indices.push (20,21,22, 20,22,23); // [0,1,2, 0,2,3] + 20
	uvs.push (b.u/UU,b.v/VV, f.u/UU,f.v/VV, g.u/UU,g.v/VV, c.u/UU,c.v/VV); // b,f,g,c

	geometry.setIndex(indices);  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));	
  let mesh = new THREE.Mesh (geometry, new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide}));
  lArm.add (mesh);
  mesh.position.y = -HH/2;
  return lArm;
}
  buildRArm(WW,HH,DD) {
	let rArm = new THREE.Group();
  var geometry = new THREE.BufferGeometry();	
  var vertices = [];
  var indices = [];
	var uvs = [];

  const ww = 1;
  const hh = 3;
  const UU = 14*ww;
  const VV = hh + 5*ww;
  
  var a = {u: 11*ww, v:hh+ww};
  var b = {u: 12*ww, v:hh+ww};
  var c = {u: 13*ww, v:hh+ww};
  var d = {u: 10*ww, v:hh};
  var e = {u: 11*ww, v:hh};
  var f = {u: 12*ww, v:hh};
  var g = {u: 13*ww, v:hh};
  var h = {u: 14*ww, v:hh};
  var i = {u: 10*ww, v:0};
  var j = {u: 11*ww, v:0};
  var k = {u: 12*ww, v:0};
  var l = {u: 13*ww, v:0};
  var m = {u: 14*ww, v:0};

	 // PZ
  vertices.push(-WW/2,HH/2,DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,HH/2,DD/2 ); // 0,3,2,1
  indices.push(0,1,2, 0,2,3);
	uvs.push (d.u/UU,d.v/VV, i.u/UU,i.v/VV, j.u/UU,j.v/VV, e.u/UU,e.v/VV); //  d,i,j,e
	// PX
  vertices.push(WW/2,HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2, WW/2,HH/2,-DD/2 ); // 1,2,6,5
  indices.push (4,5,6, 4,6,7); // [0,1,2, 0,2,3] + 4
	uvs.push (e.u/UU,e.v/VV, j.u/UU,j.v/VV, k.u/UU,k.v/VV, f.u/UU,f.v/VV); //  e,j,k,f
	// NX
  vertices.push(-WW/2,HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, -WW/2,HH/2,DD/2 ); // 4,7,3,0
  indices.push (8,9,10, 8,10,11); // [0,1,2, 0,2,3] + 8
	uvs.push (g.u/UU,g.v/VV, l.u/UU,l.v/VV, m.u/UU,m.v/VV, h.u/UU,h.v/VV); //  g,l,m,h
	// NZ
  vertices.push(WW/2,HH/2,-DD/2, WW/2,-HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,HH/2,-DD/2 ); // 5,6,7,4
  indices.push (12,13,14, 12,14,15); // [0,1,2, 0,2,3] + 12
	uvs.push (f.u/UU,f.v/VV, k.u/UU,k.v/VV, l.u/UU,l.v/VV, g.u/UU,g.v/VV); // f,k,l,g
	
	vertices.push(-WW/2,HH/2,-DD/2, -WW/2,HH/2,DD/2, WW/2,HH/2,DD/2, WW/2,HH/2,-DD/2 ); // 4,0,1,5
  indices.push (16,17,18, 16,18,19); // [0,1,2, 0,2,3] + 16
	uvs.push (a.u/UU,a.v/VV, e.u/UU,e.v/VV, f.u/UU,f.v/VV, b.u/UU,b.v/VV); // a,e,f,b
	
	vertices.push(-WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2 ); // 7,3,2,6
  indices.push (20,21,22, 20,22,23); // [0,1,2, 0,2,3] + 20
	uvs.push (b.u/UU,b.v/VV, f.u/UU,f.v/VV, g.u/UU,g.v/VV, c.u/UU,c.v/VV); // b,f,g,c

	geometry.setIndex(indices);  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));	
  let mesh = new THREE.Mesh (geometry, new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide}));
  rArm.add (mesh);
  mesh.position.y = -HH/2; 
  return rArm;
}
 buildLLeg(WW, HH, DD) {
	let lLeg = new THREE.Group();
	var geometry = new THREE.BufferGeometry();	
  var vertices = [];
  var indices = [];
	var uvs = [];

  const ww = 1;
  const hh = 3;
	const UU = 14*ww;
  const VV = hh + 5*ww;
  
  var a = {u: ww, v:hh+ww};
  var b = {u: 2*ww, v:hh+ww};
  var c = {u: 3*ww, v:hh+ww};
  var d = {u: 0, v:hh};
  var e = {u: ww, v:hh};
  var f = {u: 2*ww, v:hh};
  var g = {u: 3*ww, v:hh};
  var h = {u: 4*ww, v:hh};
  var i = {u: 0, v:0};
  var j = {u: ww, v:0};
  var k = {u: 2*ww, v:0};
  var l = {u: 3*ww, v:0};
  var m = {u: 4*ww, v:0};

	 // PZ
  vertices.push(-WW/2,HH/2,DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,HH/2,DD/2 ); // 0,3,2,1
  indices.push(0,1,2, 0,2,3);
	uvs.push (d.u/UU,d.v/VV, i.u/UU,i.v/VV, j.u/UU,j.v/VV, e.u/UU,e.v/VV); //  d,i,j,e
	// PX
  vertices.push(WW/2,HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2, WW/2,HH/2,-DD/2 ); // 1,2,6,5
  indices.push (4,5,6, 4,6,7); // [0,1,2, 0,2,3] + 4
	uvs.push (e.u/UU,e.v/VV, j.u/UU,j.v/VV, k.u/UU,k.v/VV, f.u/UU,f.v/VV); //  e,j,k,f
	// NX
  vertices.push(-WW/2,HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, -WW/2,HH/2,DD/2 ); // 4,7,3,0
  indices.push (8,9,10, 8,10,11); // [0,1,2, 0,2,3] + 8
	uvs.push (g.u/UU,g.v/VV, l.u/UU,l.v/VV, m.u/UU,m.v/VV, h.u/UU,h.v/VV); //  g,l,m,h
	// NZ
  vertices.push(WW/2,HH/2,-DD/2, WW/2,-HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,HH/2,-DD/2 ); // 5,6,7,4
  indices.push (12,13,14, 12,14,15); // [0,1,2, 0,2,3] + 12
	uvs.push (f.u/UU,f.v/VV, k.u/UU,k.v/VV, l.u/UU,l.v/VV, g.u/UU,g.v/VV); // f,k,l,g
	
	vertices.push(-WW/2,HH/2,-DD/2, -WW/2,HH/2,DD/2, WW/2,HH/2,DD/2, WW/2,HH/2,-DD/2 ); // 4,0,1,5
  indices.push (16,17,18, 16,18,19); // [0,1,2, 0,2,3] + 16
	uvs.push (a.u/UU,a.v/VV, e.u/UU,e.v/VV, f.u/UU,f.v/VV, b.u/UU,b.v/VV); // a,e,f,b
	
	vertices.push(-WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2 ); // 7,3,2,6
  indices.push (20,21,22, 20,22,23); // [0,1,2, 0,2,3] + 20
	uvs.push (b.u/UU,b.v/VV, f.u/UU,f.v/VV, g.u/UU,g.v/VV, c.u/UU,c.v/VV); // b,f,g,c

	geometry.setIndex(indices);  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));	
  let mesh = new THREE.Mesh (geometry, new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide}));
  lLeg.add (mesh);
  mesh.position.y = -HH/2;
  return lLeg;
}
  buildRLeg(WW,HH,DD) {
	let rLeg = new THREE.Group();
  var geometry = new THREE.BufferGeometry();	
  var vertices = [];
  var indices = [];
	var uvs = [];

  const ww = 1;
  const hh = 3;
	const UU = 14*ww;
  const VV = hh + 5*ww;
  
  var a = {u: ww, v:hh+ww};
  var b = {u: 2*ww, v:hh+ww};
  var c = {u: 3*ww, v:hh+ww};
  var d = {u: 0, v:hh};
  var e = {u: ww, v:hh};
  var f = {u: 2*ww, v:hh};
  var g = {u: 3*ww, v:hh};
  var h = {u: 4*ww, v:hh};
  var i = {u: 0, v:0};
  var j = {u: ww, v:0};
  var k = {u: 2*ww, v:0};
  var l = {u: 3*ww, v:0};
  var m = {u: 4*ww, v:0};

	 // PZ
  vertices.push(-WW/2,HH/2,DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,HH/2,DD/2 ); // 0,3,2,1
  indices.push(0,1,2, 0,2,3);
	uvs.push (d.u/UU,d.v/VV, i.u/UU,i.v/VV, j.u/UU,j.v/VV, e.u/UU,e.v/VV); //  d,i,j,e
	// PX
  vertices.push(WW/2,HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2, WW/2,HH/2,-DD/2 ); // 1,2,6,5
  indices.push (4,5,6, 4,6,7); // [0,1,2, 0,2,3] + 4
	uvs.push (e.u/UU,e.v/VV, j.u/UU,j.v/VV, k.u/UU,k.v/VV, f.u/UU,f.v/VV); //  e,j,k,f
	// NX
  vertices.push(-WW/2,HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, -WW/2,HH/2,DD/2 ); // 4,7,3,0
  indices.push (8,9,10, 8,10,11); // [0,1,2, 0,2,3] + 8
	uvs.push (g.u/UU,g.v/VV, l.u/UU,l.v/VV, m.u/UU,m.v/VV, h.u/UU,h.v/VV); //  g,l,m,h
	// NZ
  vertices.push(WW/2,HH/2,-DD/2, WW/2,-HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,HH/2,-DD/2 ); // 5,6,7,4
  indices.push (12,13,14, 12,14,15); // [0,1,2, 0,2,3] + 12
	uvs.push (f.u/UU,f.v/VV, k.u/UU,k.v/VV, l.u/UU,l.v/VV, g.u/UU,g.v/VV); // f,k,l,g
	
	vertices.push(-WW/2,HH/2,-DD/2, -WW/2,HH/2,DD/2, WW/2,HH/2,DD/2, WW/2,HH/2,-DD/2 ); // 4,0,1,5
  indices.push (16,17,18, 16,18,19); // [0,1,2, 0,2,3] + 16
	uvs.push (a.u/UU,a.v/VV, e.u/UU,e.v/VV, f.u/UU,f.v/VV, b.u/UU,b.v/VV); // a,e,f,b
	
	vertices.push(-WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2 ); // 7,3,2,6
  indices.push (20,21,22, 20,22,23); // [0,1,2, 0,2,3] + 20
	uvs.push (b.u/UU,b.v/VV, f.u/UU,f.v/VV, g.u/UU,g.v/VV, c.u/UU,c.v/VV); // b,f,g,c

	geometry.setIndex(indices);  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));	
  let mesh = new THREE.Mesh (geometry, new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide}));
  rLeg.add (mesh);
  mesh.position.y = -HH/2;
  return rLeg;
}
  buildTorso(WW, HH, DD) {
	let torso = new THREE.Group();
  var geometry = new THREE.BufferGeometry();	
  var vertices = [];
  var indices = [];
	var uvs = [];

  const ww = 1;
  const hh = 3;
  const UU = 14*ww;
  const VV = hh + 5*ww;
  
  var a = {u: 5*ww, v:hh+ww};
  var b = {u: 7*ww, v:hh+ww};
  var c = {u: 9*ww, v:hh+ww};
  var d = {u: 4*ww, v:hh};
  var e = {u: 5*ww, v:hh};
  var f = {u: 7*ww, v:hh};
  var g = {u: 8*ww, v:hh};
  var h = {u: 10*ww, v:hh};
  var i = {u: 4*ww, v:0};
  var j = {u: 5*ww, v:0};
  var k = {u: 7*ww, v:0};
  var l = {u: 8*ww, v:0};
  var m = {u: 10*ww, v:0};
  var x = {u: 9*ww, v: hh};

	// PZ
  vertices.push(-WW/2,HH/2,DD/2, -WW/2,-HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,HH/2,DD/2 ); // 0,3,2,1
  indices.push(0,1,2, 0,2,3);
	uvs.push (e.u/UU,e.v/VV, j.u/UU,j.v/VV, k.u/UU,k.v/VV, f.u/UU,f.v/VV); // e,j,k,f

	// PX
  vertices.push(WW/2,HH/2,DD/2, WW/2,-HH/2,DD/2, WW/2,-HH/2,-DD/2, WW/2,HH/2,-DD/2 ); // 1,2,6,5
  indices.push (4,5,6, 4,6,7); // [0,1,2, 0,2,3] + 4
	uvs.push (f.u/UU,f.v/VV, k.u/UU,k.v/VV, l.u/UU,l.v/VV, g.u/UU,g.v/VV); // f,k,l,g
	
	// NX
  vertices.push(-WW/2,HH/2,-DD/2, -WW/2,-HH/2,-DD/2, -WW/2,-HH/2,DD/2, -WW/2,HH/2,DD/2 ); // 4,7,3,0
  indices.push (8,9,10, 8,10,11); // [0,1,2, 0,2,3] + 8
	uvs.push (d.u/UU,d.v/VV, i.u/UU,i.v/VV, j.u/UU,j.v/VV, e.u/UU,e.v/VV); // d,i,j,e

	// NY
  vertices.push(-WW/2,-HH/2,DD/2, -WW/2,-HH/2,-DD/2, WW/2,-HH/2,-DD/2, WW/2,-HH/2,DD/2 ); // 3,7,6,2
  indices.push (12,13,14, 12,14,15); // [0,1,2, 0,2,3] + 12
	uvs.push (b.u/UU,b.v/VV, f.u/UU,f.v/VV, x.u/UU,x.v/VV, c.u/UU,c.v/VV); // b,f,x,c
	
	vertices.push(-WW/2,HH/2,-DD/2, -WW/2,HH/2,DD/2, WW/2,HH/2,DD/2, WW/2,HH/2,-DD/2 ); // 4,0,1,5
  indices.push (16,17,18, 16,18,19); // [0,1,2, 0,2,3] + 16
	uvs.push (a.u/UU,a.v/VV, e.u/UU,e.v/VV, f.u/UU,f.v/VV, b.u/UU,b.v/VV); // a,e,f,b
	
	vertices.push(-WW/2,HH/2,-DD/2, -WW/2,-HH/2,-DD/2, WW/2,-HH/2,-DD/2, WW/2,HH/2,-DD/2 ); // 4,7,6,5
  indices.push (20,21,22, 20,22,23); // [0,1,2, 0,2,3] + 20
	uvs.push (g.u/UU,g.v/VV, l.u/UU,l.v/VV, m.u/UU,m.v/VV, h.u/UU,h.v/VV); //  g,l,m,h

	geometry.setIndex(indices);  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));	
  let mesh = new THREE.Mesh (geometry, new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide}));
  torso.add (mesh);
  mesh.position.y = HH/2;
  mesh.rotation.y = Math.PI/2;

	return torso;
}

  setTarget(x,y,z) {
  	if (this.target !== null)
    	this.target.copy(agent.model.localToWorld(new THREE.Vector3(35,-25,-4)));
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

export{Steve}