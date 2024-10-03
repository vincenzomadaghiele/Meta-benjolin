import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* 
todo:
- squares or circles in composition bar? Transparent background and minimal timeline, floating command options
- implement exploration/composition MODES button (CHECK WITH SUPERVISORS)
    - exploration highlights points in the scatterplot without adding a box (when a new point is highlighted the old one is de-highlighted)
    - composition mode allows to add boxes. When swithcing from composition to exploration the boxes already created are left where they are
- play button colored while playing
- establishing discrete times and limit composition bar (max and min resize), fix time scales
- render arrows instead of lines
- highlighting by changing line opacity

logic: 
- you can't click on point if it's the last one being clicked
- you can't create any more elements if limit has been reached
- if it's playing, clicking anywhere stops the playing OR disable all functions until playing stops

bugs: 
- BUG: clicking play and stop many times will still send all OSC messages!!
- BUG: same is true for click on multiple objects fast. If you clicked on one object and then on another one, 
    the stop message of the previous object will still stop the next one (find a way to avoid sending these messages, maybe with this.)
- what's the problem with meander code?
- what does the stop button do?
- why do I need to send two messages for them to work? -- probably a python thing
*/

// VISUALIZATION PROPERTIES
const scale_x = 100;
const scale_y = 200;
const scale_z = 300;

// BASIC PROPERTIES
const BASE_COLOR = 0xffffff;
const BASE_SIZE = 0.1;
const BASE_OPACITY = 0.7;

// DATA
const x = new Float32Array(dataset3D['x']); //.slice(0, 100);
const y = new Float32Array(dataset3D['y']); //.slice(0, 100);
const z = new Float32Array(dataset3D['z']); //.slice(0, 100);
const N_POINTS = x.length;
let particles;

let renderer, scene, camera, material, controls, stats;
let raycaster, intersects;
let pointer, INTERSECTED;

const PARTICLE_SIZE = 15;

init();

function init() {

    // SCENE
    scene = new THREE.Scene();

    // CAMERA
    camera = new THREE.PerspectiveCamera( 45, document.getElementById("scatterPlot").offsetWidth / document.getElementById("scatterPlot").offsetHeight , 1, 10000 );
    camera.position.z = 1500;

    // RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( document.getElementById("scatterPlot").offsetWidth, document.getElementById("scatterPlot").offsetHeight );
    renderer.setAnimationLoop( animate );
    document.getElementById( 'scatterPlot' ).prepend( renderer.domElement );

    // ORBIT CONTROLS
    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 1500;
    controls.maxPolarAngle = Math.PI / 2;

    // RENDERING POINTS AS CIRCLES
	//const sprite = new THREE.TextureLoader().load( 'imgs/disc.png' );
	//sprite.colorSpace = THREE.SRGBColorSpace;

    // LOAD DATASETS
    const colors = [];
    const sizes = new Float32Array( N_POINTS );
    const color = new THREE.Color();
	const geometry = new THREE.BufferGeometry();
	const vertices = [];
    const opacities = new Float32Array( N_POINTS );
	for ( let i = 0; i < N_POINTS; i ++ ) {
        let this_x = x[i] * scale_x - (scale_x/2);
        let this_y = y[i] * scale_y - (scale_y/2);
        let this_z = z[i] * scale_z - (scale_z/2);
		vertices.push( this_x, this_y, this_z);

        //const vx = Math.random();
        //const vy = Math.random();
        //const vz = Math.random();
        //color.setRGB( vx, vy, vz );
        color.setRGB( 255, 0, 0 );

        colors.push( color.r, color.g, color.b );
        sizes[i] = PARTICLE_SIZE;
        opacities[i] = BASE_OPACITY;
	}
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
    geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) );
    geometry.setAttribute( 'opacity', new THREE.Float32BufferAttribute( opacities, 1 ) );

    //material = new THREE.PointsMaterial( { size: 0.05, vertexColors: true, map: sprite } );
    // GEOMETRY MATERIAL
    material = new THREE.ShaderMaterial( {
        uniforms: {
            color: { value: new THREE.Color( 0xffffff ) },
            pointTexture: { value: new THREE.TextureLoader().load( 'imgs/disc.png' ) },
            alphaTest: { value: 0.9 }
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
    } );

	// RENDER POINTS
	particles = new THREE.Points( geometry, material );
	scene.add( particles );

    // CLICK INTERACTION
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener( 'pointermove', onPointerMove );

    // STATS
    stats = new Stats();
    //document.getElementById( 'scatterPlot' ).appendChild( stats.dom );

}

// UPDATE POINTER POSITION
function onPointerMove( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
// UPDATE WINDOW SIZE
function onWindowResize() {
    camera.aspect = document.getElementById("scatterPlot").offsetWidth / document.getElementById("scatterPlot").offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( document.getElementById("scatterPlot").offsetWidth , document.getElementById("scatterPlot").offsetHeight * 0.85 );
}
// ANIMATE FOR CAMERA NAVIGATION
function animate() {
    //controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    render();
}
// RENDER FUNCTION FOR ANIMATION
function render() {
    const time = Date.now() * 0.5;
    if ( !ISPLAYBACKON && !ISLONGPLAYBACKON && MOUSEONSCATTERPLOT){
        pickHelper.pick(pickPosition, scene, camera, time);
        if (isMouseDown){ // check for click and not drag
            setTimeout(function(){ if ( !isMouseDown && timer < 500){ pickHelper.click(pickPosition, scene, camera, time); }}, 5);
        }
    }
    if ( !MOUSEONSCATTERPLOT ){
        pointToBasic(CURRENTPICKEDINDEX)
        CURRENTPICKEDINDEX = null;
    }
    renderer.render( scene, camera );
}

let CURRENTPICKEDINDEX = null;

// HANDLE PICK AND CLICK EVENTS
let clickedIndices = [];
let canvas = renderer.domElement;
class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.pickedObjectIndex = null;
      this.pickedObjectSavedColor = 0;
      this.clickedObject = null;
      this.clickedObjectIndex = null;
    }
    pick(normalizedPosition, scene, camera, time) {
        // restore the color if there is a picked object
        if (this.pickedObject) {
            if ( !clickedIndices.includes(this.pickedObjectIndex) ) {
                particles.geometry.attributes.size.array[ this.pickedObjectIndex ] = PARTICLE_SIZE;
                particles.geometry.attributes.opacity.array[ this.clickedObjectIndex ] = BASE_OPACITY;
                let newcolor = new THREE.Color();
                newcolor.setRGB( 255, 0, 0 );
                particles.geometry.attributes.customColor.array[ this.pickedObjectIndex * 3 ] = newcolor.r;
                particles.geometry.attributes.customColor.array[ this.pickedObjectIndex * 3 + 1 ] = newcolor.g;
                particles.geometry.attributes.customColor.array[ this.pickedObjectIndex * 3 + 2 ] = newcolor.b;
            }
            this.pickedObject = undefined;
            this.pickedObjectIndex = undefined;
            CURRENTPICKEDINDEX = this.pickedObjectIndex;
        }
        // cast a ray through the frustum
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            // pick the first object. It's the closest one
            this.pickedObject = intersectedObjects[0].object;
            this.pickedObjectIndex = intersectedObjects[0].index;
            if ( !clickedIndices.includes(this.pickedObjectIndex) ){
                particles.geometry.attributes.size.array[ this.pickedObjectIndex ] = PARTICLE_SIZE * 20;
                particles.geometry.attributes.size.needsUpdate = true;
                // update opacity
                particles.geometry.attributes.opacity.array[ this.clickedObjectIndex ] = 1;
                particles.geometry.attributes.opacity.needsUpdate = true;                
                // change color of picked object to white
                let newcolor = new THREE.Color();
                newcolor.setRGB( 255, 255, 255 );
                particles.geometry.attributes.customColor.array[ this.pickedObjectIndex * 3 ] = newcolor.r;
                particles.geometry.attributes.customColor.array[ this.pickedObjectIndex * 3 + 1 ] = newcolor.g;
                particles.geometry.attributes.customColor.array[ this.pickedObjectIndex * 3 + 2 ] = newcolor.b;
                particles.geometry.attributes.customColor.needsUpdate = true;
                //material.needsUpdate = true*/
            }
            //console.log("picked ID: "+intersectedObjects[0].index);
            sendBox(x[this.pickedObjectIndex], y[this.pickedObjectIndex]);
        }
    }
    click(normalizedPosition, scene, camera, time) {
        // restore the color if there is a picked object
        if (this.clickedObject) {
            this.clickedObject = undefined;
            this.clickedObjectIndex = undefined;
        }
        // cast a ray through the frustum
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            if (intersectedObjects[0].index != this.clickedObjectIndex){
                let compositionTime = calculateCurrentCompostionTime();
                if ( compositionTime < MAX_COMPOSITION_TIME){
                    
                    // click the first object. It's the closest one            
                    this.clickedObject = intersectedObjects[0].object;
                    this.clickedObjectIndex = intersectedObjects[0].index;
                    clickedIndices.push(this.clickedObjectIndex);
                    // update size
                    particles.geometry.attributes.size.array[ this.clickedObjectIndex ] = PARTICLE_SIZE * 20;
                    particles.geometry.attributes.size.needsUpdate = true;
                    // update opacity
                    particles.geometry.attributes.opacity.array[ this.clickedObjectIndex ] = 1;
                    particles.geometry.attributes.opacity.needsUpdate = true;
                    // update color
                    let newcolor = new THREE.Color();
                    newcolor.setRGB( Math.random(), Math.random(), Math.random() );
                    particles.geometry.attributes.customColor.array[ this.clickedObjectIndex * 3 ] = newcolor.r;
                    particles.geometry.attributes.customColor.array[ this.clickedObjectIndex * 3 + 1 ] = newcolor.g;
                    particles.geometry.attributes.customColor.array[ this.clickedObjectIndex * 3 + 2 ] = newcolor.b;
                    particles.geometry.attributes.customColor.needsUpdate = true;
                    material.needsUpdate = true
                    console.log("clicked ID: "+intersectedObjects[0].index);

                    addBox(x[ this.clickedObjectIndex ], y[ this.clickedObjectIndex ], z[ this.clickedObjectIndex ], 
                        newcolor.getHexString(), this.clickedObjectIndex); 
                    renderPath()
                }
                //console.log(pts);
            }
        }
    }
}

// RENDERING FUNCTIONS
function pointToBasic(pointIndex){
    // restore point rendering to the basic properties
    // update size
    particles.geometry.attributes.size.array[ pointIndex ] = PARTICLE_SIZE;
    particles.geometry.attributes.size.needsUpdate = true;
    // update color
    let newcolor = new THREE.Color();
    newcolor.setRGB( 255, 0, 0 );
    particles.geometry.attributes.customColor.array[ pointIndex * 3 ] = newcolor.r;
    particles.geometry.attributes.customColor.array[ pointIndex * 3 + 1 ] = newcolor.g;
    particles.geometry.attributes.customColor.array[ pointIndex * 3 + 2 ] = newcolor.b;
    particles.geometry.attributes.customColor.needsUpdate = true;
    material.needsUpdate = true
}

// RENDERING FUNCTIONS
function pointHighlighted(pointIndex){
    // restore point rendering to the basic properties
    // update size
    particles.geometry.attributes.size.array[ pointIndex ] = PARTICLE_SIZE;
    particles.geometry.attributes.size.needsUpdate = true;
    // update color
    let newcolor = new THREE.Color();
    newcolor.setRGB( 255, 0, 0 );
    particles.geometry.attributes.customColor.array[ pointIndex * 3 ] = newcolor.r;
    particles.geometry.attributes.customColor.array[ pointIndex * 3 + 1 ] = newcolor.g;
    particles.geometry.attributes.customColor.array[ pointIndex * 3 + 2 ] = newcolor.b;
    particles.geometry.attributes.customColor.needsUpdate = true;
    material.needsUpdate = true
}


let arrowsIDs = []
// RENDER PATH
function renderPath(){
    let countMeanders = 0;
    arrowsIDs = [];
    console.log(MEANDERS_LIST);
    //MEANDERS_LIST = [];

    //meanders = [];
    // remove all previous arrows
    for (let i = 0; i < arrowsIDs.length; i++) {
        var selectedObject = scene.getObjectByName(arrowsIDs[i]);
        scene.remove( selectedObject );
    }
    // draw new arrows
    for (let i = 0; i < compositionArray.length; i++) {
        if (i !=0){ // check if not on the first object
            if (compositionArray[i] instanceof Meander){
                // check if before and after there are boxes
                if (compositionArray[i-1] instanceof Box && compositionArray[i+1] instanceof Box){ 
                    countMeanders += 1;
                    // add dotted line if meander
                    //x: [compositionArray[i-1].x,compositionArray[i+1].x],
                    //y: [compositionArray[i-1].y,compositionArray[i+1].y],
                    let linepoints = [];
                    
                    sendDrawMeander( compositionArray[i-1].x,compositionArray[i-1].y,
                                    compositionArray[i+1].x,compositionArray[i+1].y );
                    /*let thismeander = MEANDERS_LIST[0];
                    console.log(thismeander);
                    for (let i = 0; i < thismeander.length; i++) {
                        let x1 = x[parseFloat(thismeander[i])] * scale_x - (scale_x/2),
                            y1 = y[parseFloat(thismeander[i])] * scale_y - (scale_y/2),
                            z1 = z[parseFloat(thismeander[i])] * scale_z - (scale_z/2);
                            linepoints.push( new THREE.Vector3( x1,y1,z1 )); 
                    }*/
                    let x1 = compositionArray[i-1].x * scale_x - (scale_x/2),
                        y1 = compositionArray[i-1].y * scale_y - (scale_y/2),
                        z1 = compositionArray[i-1].z * scale_z - (scale_z/2);
                    let x2 = compositionArray[i+1].x * scale_x - (scale_x/2),
                        y2 = compositionArray[i+1].y * scale_y - (scale_y/2),
                        z2 = compositionArray[i+1].z * scale_z - (scale_z/2);
                    linepoints.push( new THREE.Vector3( x1,y1,z1 )); 
                    linepoints.push( new THREE.Vector3( x2,y2,z2 )); 

                    let linegeometry = new THREE.BufferGeometry().setFromPoints( linepoints );
                    let linematerial = new THREE.LineDashedMaterial( {  color: 0xffaa0, dashSize: 3, gapSize: 1, opacity: 0.1 } );
                    let line = new THREE.Line( linegeometry, linematerial );
                    line.computeLineDistances();
                    //let line = customArrow(x1,y1,z1,x2,y2,z2, 10, 0x0000ff);
                    let line_name = "meander "+compositionArray[i-1].arrayIndex+' '+compositionArray[i+1].arrayIndex;
                    line.name = line_name;
                    arrowsIDs.push(line_name);
                    scene.add( line );
                }
            }
            if (compositionArray[i] instanceof Crossfade){
                // check if before and after there are boxes
                if (compositionArray[i-1] instanceof Box && compositionArray[i+1] instanceof Box){ 
                    // add dashed line if crossfade
                    //x: [compositionArray[i-1].x,compositionArray[i+1].x],
                    //y: [compositionArray[i-1].y,compositionArray[i+1].y],
                    let linepoints = [];
                    let x1 = compositionArray[i-1].x * scale_x - (scale_x/2),
                        y1 = compositionArray[i-1].y * scale_y - (scale_y/2),
                        z1 = compositionArray[i-1].z * scale_z - (scale_z/2);
                    let x2 = compositionArray[i+1].x * scale_x - (scale_x/2),
                        y2 = compositionArray[i+1].y * scale_y - (scale_y/2),
                        z2 = compositionArray[i+1].z * scale_z - (scale_z/2);
                    linepoints.push( new THREE.Vector3( x1,y1,z1 )); 
                    linepoints.push( new THREE.Vector3( x2,y2,z2 )); 
                    let linegeometry = new THREE.BufferGeometry().setFromPoints( linepoints );
                    let linematerial = new THREE.LineDashedMaterial( {  color: 0xffffff, dashSize: 1, gapSize: 0.5, opacity: 0.1 } );
                    let line = new THREE.Line( linegeometry, linematerial );
                    line.computeLineDistances();
                    //let line = customArrow(x1,y1,z1,x2,y2,z2, 10, 0x0000ff);
                    let line_name = "crossfade "+compositionArray[i-1].arrayIndex+' '+compositionArray[i+1].arrayIndex;
                    line.name = line_name;
                    arrowsIDs.push(line_name);
                    scene.add( line );
                }
            }
            if (compositionArray[i] instanceof Box){
                // check if before there is a box
                if (compositionArray[i-1] instanceof Box){ 
                    // add straight line if jump
                    //x: [compositionArray[i-1].x,compositionArray[i+1].x],
                    //y: [compositionArray[i-1].y,compositionArray[i+1].y],
                    let linepoints = [];
                    let x1 = compositionArray[i-1].x * scale_x - (scale_x/2),
                        y1 = compositionArray[i-1].y * scale_y - (scale_y/2),
                        z1 = compositionArray[i-1].z * scale_z - (scale_z/2);
                    let x2 = compositionArray[i].x * scale_x - (scale_x/2),
                        y2 = compositionArray[i].y * scale_y - (scale_y/2),
                        z2 = compositionArray[i].z * scale_z - (scale_z/2);
                    linepoints.push( new THREE.Vector3( x1,y1,z1 )); 
                    linepoints.push( new THREE.Vector3( x2,y2,z2 )); 
                    let linegeometry = new THREE.BufferGeometry().setFromPoints( linepoints );
                    let linematerial = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 10, opacity: 0.1} );
                    let line = new THREE.Line( linegeometry, linematerial );
                    let line_name = "jump "+compositionArray[i-1].arrayIndex+' '+compositionArray[i].arrayIndex;
                    line.name = line_name;
                    arrowsIDs.push(line_name);
                    scene.add( line );

                    //var to = new THREE.Vector3( x2, y2, z2 );
                    //var from = new THREE.Vector3( x1, y1, z1 );
                    //var direction = to.clone().sub(from);
                    //var length = direction.length();
                    //var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xffff00 );
                    //arrowHelper.line.material = linematerial;
                    //arrowHelper.line.computeLineDistances();
                    //scene.add( arrowHelper );

                }
            }
        }
    }
}


const pickPosition = {x: 0, y: 0}; // pick position in 2D space
clearPickPosition();
function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * canvas.width  / rect.width,
        y: (event.clientY - rect.top ) * canvas.height / rect.height,
    };
}
function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
    pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}
function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    pickPosition.x = -100000;
    pickPosition.y = -100000;
}
window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);
window.addEventListener('touchstart', (event) => {
    // prevent the window from scrolling
    event.preventDefault();
    setPickPosition(event.touches[0]);
  }, {passive: false});
window.addEventListener('touchmove', (event) => {
    setPickPosition(event.touches[0]);
});
window.addEventListener('touchend', clearPickPosition);
const pickHelper = new PickHelper();
let isMouseDown = false;
let timer = 0;
let startTime = 0;
let endTime = 0;
canvas.onmousedown = function(){
    isMouseDown = true;
    startTime = new Date().getTime();
    let timer = 0;
}; 
canvas.onmouseup = function(){
    isMouseDown = false;
    endTime = new Date().getTime();
    timer = endTime -startTime;
}; 


// COMPOSITION FUNCTIONALITIES
class Box{
    constructor(x, y, z, duration, arrayIndex){
        this.x = x;
        this.y = y;
        this.z = z;
        this.duration = duration;
        this.arrayIndex = arrayIndex; // index in the array
    }
}
class Meander{
    constructor(duration){
        this.duration = duration;
    }
}
class Crossfade{
    constructor(duration){
        this.duration = duration;
    }
}
const compositionArray = [];

const MAX_COMPOSITION_TIME = 2 * 60 * 1000; // max compostion time in ms
function calculateCurrentCompostionTime(){
    let compositionTime = 0;
    for (let i = 0; i < compositionArray.length; i++) {
        compositionTime += compositionArray[i].duration * 1000
    }
    return compositionTime
}

function pxToDuration(px){
    // 50 px = 6 s
    let k = 6 / 50;
    let dur = k * px;
    return dur
}

// add a box when a point on the scatterplot is clicked
var numBoxes = 0
function addBox(boxx, boxy, boxz, randomcolor, arrayIndex) {
    let compositionTime = calculateCurrentCompostionTime();
    if ( compositionTime < MAX_COMPOSITION_TIME && !ISLONGPLAYBACKON ){
        let newBox = document.createElement("div");
        newBox.className = 'box hover';
        newBox.id = 'box '+numBoxes;
        newBox.style["background-color"] = '#'+randomcolor;
        newBox.style["height"] = '50px';
        newBox.style["width"] = '100%';
        newBox.style["resize"] = 'vertical';
        newBox.style["overflow-x"] = 'auto';
        newBox.draggable = 'true';
        newBox.addEventListener('dragstart', dragStart);
        newBox.addEventListener('dragenter', dragEnter)
        newBox.addEventListener('dragover', dragOver);
        newBox.addEventListener('dragleave', dragLeave);
        newBox.addEventListener('drop', drop);
        document.getElementById("compose-bar").appendChild(newBox); 
        numBoxes += 1;
        var duration = pxToDuration(newBox.clientHeight); 
        compositionArray.push(new Box(boxx, boxy, boxz, duration, arrayIndex));
        //console.log(compositionArray);
        observer.observe(newBox);
    }
}

// prevent images inside boxes from being draggable
function dragImgInsideBox(e) {
    e.preventDefault();
    e.stopPropagation(); 
}

// add new crossfade
function addCrossfade(){
    let compositionTime = calculateCurrentCompostionTime();
    if ( compositionTime < MAX_COMPOSITION_TIME && !ISLONGPLAYBACKON ){

        const newImg = document.createElement("img");
        newImg.src = "imgs/arrow.png";
        newImg.id = "img-inside-box";
        newImg.className = "img-fluid img-inside-box";
        newImg.style["height"] = '80%';

        const newCrossfade = document.createElement("div");
        newCrossfade.className = 'crossfade text-center hover';
        newCrossfade.id = 'box ' + numBoxes;
        newCrossfade.style["background-color"] = "rgba(0, 0, 0, 0.)"; //transparent background color
        newCrossfade.style["height"] = '50px';
        newCrossfade.style["width"] = '100%';
        newCrossfade.style["resize"] = 'vertical';
        newCrossfade.style["overflow-x"] = 'auto';
        newCrossfade.draggable = 'true';

        newCrossfade.appendChild(newImg)
        document.getElementById("compose-bar").appendChild(newCrossfade); 

        newCrossfade.addEventListener('dragstart', dragStart);
        newCrossfade.addEventListener('dragenter', dragEnter)
        newCrossfade.addEventListener('dragover', dragOver);
        newCrossfade.addEventListener('dragleave', dragLeave);
        newCrossfade.addEventListener('drop', drop);

        newImg.addEventListener('dragstart', dragImgInsideBox);
        newImg.addEventListener('dragenter', dragImgInsideBox)
        newImg.addEventListener('dragover', dragImgInsideBox);
        newImg.addEventListener('dragleave', dragImgInsideBox);
        newImg.addEventListener('drop', dragImgInsideBox);

        numBoxes += 1;

        var duration = pxToDuration( newCrossfade.clientHeight ); 
        compositionArray.push(new Crossfade(duration));
        observer.observe(newCrossfade);
        // update visualization
    }

}

// add new meander
function addMeander(){

    let compositionTime = calculateCurrentCompostionTime();
    if ( compositionTime < MAX_COMPOSITION_TIME && !ISLONGPLAYBACKON ){

        const newImg = document.createElement("img");
        newImg.src = "imgs/zigzag.png";
        newImg.id = "img-inside-box";
        newImg.className = "img-fluid img-inside-box";
        newImg.style["height"] = '80%';

        const newMeander = document.createElement("div");
        newMeander.className = 'meander text-center hover';
        newMeander.id = 'box ' + numBoxes;
        newMeander.style["background-color"] = "rgba(0, 0, 0, 0.)";
        newMeander.style["height"] = '50px';
        newMeander.style["width"] = '100%';
        newMeander.style["resize"] = 'vertical';
        newMeander.style["overflow-x"] = 'auto';
        newMeander.draggable = 'true';
        
        newMeander.appendChild(newImg)
        document.getElementById("compose-bar").appendChild(newMeander); 

        newMeander.addEventListener('dragstart', dragStart);
        newMeander.addEventListener('dragenter', dragEnter)
        newMeander.addEventListener('dragover', dragOver);
        newMeander.addEventListener('dragleave', dragLeave);
        newMeander.addEventListener('drop', drop);

        newImg.addEventListener('dragstart', dragImgInsideBox);
        newImg.addEventListener('dragenter', dragImgInsideBox)
        newImg.addEventListener('dragover', dragImgInsideBox);
        newImg.addEventListener('dragleave', dragImgInsideBox);
        newImg.addEventListener('drop', dragImgInsideBox);

        numBoxes += 1;

        var duration = pxToDuration(newMeander.clientHeight); 
        compositionArray.push(new Meander(duration));
        observer.observe(newMeander);
        // update visualization
    }
}

// handling navbar elements
const insert_crossfade = document.getElementById("insert-crossfade"); 
insert_crossfade.addEventListener("click", addCrossfade); 
const insert_meander = document.getElementById("insert-meander"); 
insert_meander.addEventListener("click", addMeander); 

// dragging and dropping boxes
function dragStart(e) {
    //console.log('drag starts...');
    e.dataTransfer.setData('text/plain', e.target.id);
 }
 function dragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
 }
 function dragOver(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
 }
 function dragLeave(e) {
    e.target.classList.remove('drag-over');
 }
 function drop(e) {
    e.target.classList.remove('drag-over');

    // get the draggable element
    let id = e.dataTransfer.getData('text/plain');
    let draggable = document.getElementById(id);

    // get box indices
    let index_draggable = Number(id.split(' ')[1]);
    let index_target = Number(e.target.id.split(' ')[1]);
    var draggable_x = null;
    var draggable_y = null;
    var target_x = null;
    var target_y = null;
    if (compositionArray[index_draggable] instanceof Box){
        draggable_x = compositionArray[index_draggable].x;
        draggable_y = compositionArray[index_draggable].y;
    }
    if (compositionArray[index_target] instanceof Box){
        target_x = compositionArray[index_target].x;
        target_y = compositionArray[index_target].x;
    }

    if (index_draggable != index_target){
        
        // locate boxes to swap
        let target_node = e.target.parentElement.children[index_target];
        let draggable_node = e.target.parentElement.children[index_draggable];
        console.log('swapping box '+ index_draggable + ' with box '+ index_target);
        let parent = e.target.parentElement;
        // swap boxes
        exchangeElements(draggable_node, target_node);
        [compositionArray[index_draggable], compositionArray[index_target]] = [compositionArray[index_target], compositionArray[index_draggable]];

        // correct ids
        let new_target_node = document.getElementById('box '+ (index_target));
        let new_draggable_node = document.getElementById('box '+ (index_draggable)); 
        new_target_node.id = 'box ' + (index_draggable);
        new_draggable_node.id = 'box ' + (index_target);
    }
    // display the draggable element
    draggable.classList.remove('hide');
    // update scatterplot representation
    renderPath();
}

// exchange boxes
function exchangeElements(element1, element2){
    var clonedElement1 = element1.cloneNode(true);
    var clonedElement2 = element2.cloneNode(true);
    clonedElement1.addEventListener('dragstart', dragStart);
    clonedElement1.addEventListener('dragenter', dragEnter)
    clonedElement1.addEventListener('dragover', dragOver);
    clonedElement1.addEventListener('dragleave', dragLeave);
    clonedElement1.addEventListener('drop', drop);
    clonedElement2.addEventListener('dragstart', dragStart);
    clonedElement2.addEventListener('dragenter', dragEnter)
    clonedElement2.addEventListener('dragover', dragOver);
    clonedElement2.addEventListener('dragleave', dragLeave);
    clonedElement2.addEventListener('drop', drop);
    if (clonedElement1.children.length > 0){
        clonedElement1.children[0].addEventListener('dragstart', dragImgInsideBox);
        clonedElement1.children[0].addEventListener('dragenter', dragImgInsideBox)
        clonedElement1.children[0].addEventListener('dragover', dragImgInsideBox);
        clonedElement1.children[0].addEventListener('dragleave', dragImgInsideBox);
        clonedElement1.children[0].addEventListener('drop', dragImgInsideBox);
    }
    if (clonedElement2.children.length > 0){
        clonedElement2.children[0].addEventListener('dragstart', dragImgInsideBox);
        clonedElement2.children[0].addEventListener('dragenter', dragImgInsideBox)
        clonedElement2.children[0].addEventListener('dragover', dragImgInsideBox);
        clonedElement2.children[0].addEventListener('dragleave', dragImgInsideBox);
        clonedElement2.children[0].addEventListener('drop', dragImgInsideBox);
    }
    element2.parentNode.replaceChild(clonedElement1, element2);
    element1.parentNode.replaceChild(clonedElement2, element1);
    observer.observe(clonedElement1);
    observer.observe(clonedElement2);
}


// implement trash bin
function dropOnTrashBin(e) {
    // update class list
    e.target.classList.remove('drag-over');
    // find and remove draggable element
    let id_draggable = e.dataTransfer.getData('text/plain');
    let draggable = document.getElementById(id_draggable);
    let parent = draggable.parentNode
    // reset color and size of scatterplot element
    let removed_box_index = Number(id_draggable.split(' ')[1]);
    if (compositionArray[removed_box_index] instanceof Box){
        pointToBasic(compositionArray[removed_box_index].arrayIndex);
        // remove scatterplot element
        //var scatterplot_index = findIndexGivenCoords(compositionArray[removed_box_index].x, compositionArray[removed_box_index].y);
        //sizes[scatterplot_index] = base_size;
        //colors[scatterplot_index] = base_color;
        // update visualization
    }
    draggable.remove();
    numBoxes -= 1;
    // adjust IDs of remaining boxes
    for (var i = removed_box_index; i < numBoxes; i++) {
        var old_id = parent.children[i].id.split(' ');
        old_id[1] = Number(old_id[1])-1;
        parent.children[i].id = old_id.join(' ');
    }
    // remove item from composition array
    let comp_index = Number(id_draggable.split(' ')[1]);
    compositionArray.splice(comp_index, 1);
    // reduce number of boxes
    console.log('removing element: '+ comp_index);
    // update visualization
    renderPath();
}

// trash bin functionalities
var trashBin = document.getElementById('bin');
trashBin.addEventListener('dragover', dragOver);
trashBin.addEventListener('dragenter', dragEnter)
trashBin.addEventListener('dragleave', dragLeave);
trashBin.addEventListener('drop', dropOnTrashBin);
trashBin.parentNode.addEventListener('dragover', dragImgInsideBox);
trashBin.parentNode.addEventListener('dragenter', dragImgInsideBox);
trashBin.parentNode.addEventListener('dragleave', dragImgInsideBox);
trashBin.parentNode.addEventListener('drop', dragImgInsideBox);

// check for resize event
const observer = new ResizeObserver(function(mutations) {
    var resizedID = mutations[0].target.attributes.id.nodeValue;
    var resized_newHeight = mutations[0].contentRect.height; // height in px
    // scale px to width of marker: 100px = 20px marker
    console.log('resizing '+resizedID);

    // update box duration in composition array
    var boxNumber = Number(resizedID.split(' ')[1]);
    if(compositionArray[boxNumber] && resized_newHeight != 0){
        compositionArray[boxNumber].duration = pxToDuration(resized_newHeight);
    }

    // check if resized element is a box
    if (compositionArray[boxNumber] instanceof Box){
        // find index of resized element in array of all point coordinates
        //var index = findIndexGivenCoords(compositionArray[boxNumber].x, compositionArray[boxNumber].y);
        //resize marker
        var heightToPointSize = 0.25;
        particles.geometry.attributes.size.array[ compositionArray[boxNumber].arrayIndex ] = PARTICLE_SIZE * resized_newHeight * heightToPointSize;
        particles.geometry.attributes.size.needsUpdate = true;
    
        //var update = {'marker':{color:colors, size:sizes, opacity:opacity}};
        //Plotly.restyle('scatterPlot', update, 0);
    }
    //console.log(mutations[0].target.attributes.id);
    //console.log(mutations[0].contentRect.width, mutations[0].contentRect.height);
});


// HIGHLIGHT BOX ON CLICK
//let clicked = false;
//document.addEventListener('mousedown', e => { clicked = true; });
//document.addEventListener('mousemove', e => { clicked = false; });
//document.addEventListener('mouseup', event => {
document.addEventListener('click', event => {
    if ( !ISLONGPLAYBACKON ) {
        highlightBoxElement(event.target);
    } 
})

// PLAY FUNCTION
var ISPLAYBACKON = false;
var ISLONGPLAYBACKON = false;
var play = function(){
    var timeout = 0;
    ISLONGPLAYBACKON = true;
    disableAllInteractions();
    console.log("playing composition: ", compositionArray)
    for (let i = 0; i < compositionArray.length; i++) {
            setTimeout(function() {
                if( ISLONGPLAYBACKON ){
                    console.log('playing: ',compositionArray[i]);
                    //sendBox(compositionArray[i].x, compositionArray[i].y);
                    highlightBoxElement(document.getElementById('box '+i)); 
                }
            }, timeout);
            timeout += (compositionArray[i].duration * 1000);    
        //console.log(timeout);
    }
    setTimeout(function() {
        if( ISLONGPLAYBACKON ){
            console.log('End of composition');
            ISLONGPLAYBACKON = false;
            sendStop();
            enableAllInteractions();
            document.getElementById("box "+(compositionArray.length-1)).classList.remove('click-on-box');
        }
    }, timeout+100);
};
document.getElementById("play").onclick = play;

let MOUSEONSCATTERPLOT = false;
document.getElementById("scatterPlot").addEventListener("mouseenter", function(  ) {
    MOUSEONSCATTERPLOT=true;
});
document.getElementById("scatterPlot").addEventListener("mouseout", function(  ) { 
    MOUSEONSCATTERPLOT=false;
    if (!ISPLAYBACKON && !ISLONGPLAYBACKON ){
        sendStop();
    }
});

var stopPlayback = function(){
    sendStop();
    ISLONGPLAYBACKON = false;
    ISPLAYBACKON = false;
    var all_click_on_box = document.getElementsByClassName('click-on-box');
    for (var i = 0; i < all_click_on_box.length; i++) {
        all_click_on_box[i].classList.remove('click-on-box');
    }
    enableAllInteractions();
}
document.getElementById("stop").onclick = stopPlayback;

function disableAllInteractions(){
    document.getElementById("insert-crossfade-button").disabled = true;
    document.getElementById("insert-meander-button").disabled = true;
    document.getElementById("bin-button").disabled = true;
    document.getElementById("play-button").disabled = true;
    for (var i = 0; i < numBoxes; i++) {
        let thisbox = document.getElementById("box "+i);
        thisbox.draggable = false;
        thisbox.style["resize"] = null;
        thisbox.style["overflow-x"] = null;
        thisbox.classList.remove("hover");
    }
}

function enableAllInteractions(){
    document.getElementById("insert-crossfade-button").disabled = false;
    document.getElementById("insert-meander-button").disabled = false;
    document.getElementById("bin-button").disabled = false;
    document.getElementById("play-button").disabled = false;
    for (var i = 0; i < numBoxes; i++) {
        let thisbox = document.getElementById("box "+i);
        thisbox.draggable = true;
        thisbox.style["resize"] = 'vertical';
        thisbox.style["overflow-x"] = 'auto';
        thisbox.classList.add("hover");
    }
}

function highlightBoxElement(element){
    if ( !ISLONGPLAYBACKON ){
        // highlight box and show what is playing graphically 
        if ( element.classList.contains('box') ){
            if ( !ISPLAYBACKON ){ 
                graphicHighlightBox(element);
                var boxNumber = Number(element.id.split(' ')[1]);
                // listen to box
                sendBox(compositionArray[boxNumber].x, compositionArray[boxNumber].y);
                ISPLAYBACKON = true;
                setTimeout(function() {
                    if ( !ISLONGPLAYBACKON && ISPLAYBACKON ){
                        document.getElementById(element.id).classList.remove('click-on-box');
                        console.log("end of single box playback");
                        ISPLAYBACKON = false;
                        sendStop();
                    }
                }, compositionArray[boxNumber].duration * 1000);    
            }
        } else if (element.classList.contains('meander')){
            if ( !ISPLAYBACKON ){ 
                graphicHighlightBox(element);
                // send OSC and listen to meander 
                var compositionIndex = Number(element.id.split(' ')[1]);
                if (compositionIndex != 0 && compositionArray[compositionIndex] instanceof Meander){
                    // check if before and after there are boxes
                    if (compositionArray[compositionIndex-1] instanceof Box && compositionArray[compositionIndex+1] instanceof Box){
                        sendBox(compositionArray[compositionIndex-1].x, compositionArray[compositionIndex-1].y);
                        sendMeander(compositionArray[compositionIndex-1].x, compositionArray[compositionIndex-1].y, 
                            compositionArray[compositionIndex+1].x, compositionArray[compositionIndex+1].y, 
                            compositionArray[compositionIndex].duration);
                        ISPLAYBACKON = true;
                        setTimeout(function() {
                            if ( !ISLONGPLAYBACKON && ISPLAYBACKON ){
                                console.log("end of single crossfade playback");
                                ISPLAYBACKON = false;
                                sendStop();
                                document.getElementById(element.id).classList.remove('click-on-box');
                            }
                        }, compositionArray[compositionIndex].duration * 1000);
                    }
                }
            }
        } else if (element.classList.contains('crossfade')){
            if ( !ISPLAYBACKON ){ 
                graphicHighlightBox(element);
                // send OSC and listen to crossfade 
                var compositionIndex = Number(element.id.split(' ')[1]);
                if (compositionIndex != 0 && compositionArray[compositionIndex] instanceof Crossfade){
                    // check if before and after there are boxes
                    if (compositionArray[compositionIndex-1] instanceof Box && compositionArray[compositionIndex+1] instanceof Box){
                        sendBox(compositionArray[compositionIndex-1].x, compositionArray[compositionIndex-1].y);
                        sendCrossfade(compositionArray[compositionIndex-1].x, compositionArray[compositionIndex-1].y, 
                                    compositionArray[compositionIndex+1].x, compositionArray[compositionIndex+1].y, 
                                    compositionArray[compositionIndex].duration);
                            ISPLAYBACKON = true;
                            setTimeout(function() {
                                if ( !ISLONGPLAYBACKON && ISPLAYBACKON ){
                                    console.log("end of single meander playback");
                                    ISPLAYBACKON = false;
                                    sendStop();
                                    document.getElementById(element.id).classList.remove('click-on-box');
                                }
                            }, compositionArray[compositionIndex].duration * 1000);
                        }
                    }
            }
        } else {
            // in playback mode DO NOTHING on click outside box or on other boxes 
            graphicHighlightBox(element);
            sendStop();
            ISPLAYBACKON = false;
        }
    } else {
        if ( element.classList.contains('box') ){
            graphicHighlightBox(element);
            var boxNumber = Number(element.id.split(' ')[1]);
            // listen to box
            sendBox(compositionArray[boxNumber].x, compositionArray[boxNumber].y);
        } else if (element.classList.contains('crossfade')){
            var compositionIndex = Number(element.id.split(' ')[1]);
            // check if before and after there are boxes
            if (compositionIndex != 0 && compositionArray[compositionIndex] instanceof Crossfade){
                // send OSC and listen to meander 
                if (compositionArray[compositionIndex-1] instanceof Box && compositionArray[compositionIndex+1] instanceof Box){
                    graphicHighlightBox(element);
                    sendBox(compositionArray[compositionIndex-1].x, compositionArray[compositionIndex-1].y);
                    sendCrossfade(compositionArray[compositionIndex-1].x, compositionArray[compositionIndex-1].y, 
                        compositionArray[compositionIndex+1].x, compositionArray[compositionIndex+1].y, 
                        compositionArray[compositionIndex].duration);
                }
            }
        } else if ( element.classList.contains('meander') ){
            // check if before and after there are boxes
            var compositionIndex = Number(element.id.split(' ')[1]);
            if (compositionIndex != 0 && compositionArray[compositionIndex] instanceof Meander){
                if (compositionArray[compositionIndex-1] instanceof Box && compositionArray[compositionIndex+1] instanceof Box){
                    // send OSC and listen to crossfade 
                    graphicHighlightBox(element);
                    sendBox(compositionArray[compositionIndex-1].x, compositionArray[compositionIndex-1].y);
                    sendMeander(compositionArray[compositionIndex-1].x, compositionArray[compositionIndex-1].y, 
                                compositionArray[compositionIndex+1].x, compositionArray[compositionIndex+1].y, 
                                compositionArray[compositionIndex].duration);
                }
            }
        } 
    }
}

function graphicHighlightBox(element){
    // highlight box
    if ( element.classList.contains('box') ) {
        element.classList.add('click-on-box');
        // highlight dot in the scatterplot
        var newopacities = new Float32Array( N_POINTS ).fill(0.3);
        var compositionIndex = Number(element.id.split(' ')[1]);
        newopacities[compositionArray[compositionIndex].arrayIndex] = 1;
        particles.geometry.attributes.opacity.array = newopacities;
        particles.geometry.attributes.opacity.needsUpdate = true;
        // reset opacity of all other lines
        for (var i = 0; i < arrowsIDs.length; i++) {
            var lineObject = scene.getObjectByName( arrowsIDs[i] );
            lineObject.material.opacity = 0.1;    
        }

    } else if ( element.classList.contains('meander') ) {
        element.classList.add('click-on-box');
        var newopacities = new Float32Array( N_POINTS ).fill(0.3);
        particles.geometry.attributes.opacity.array = newopacities;
        particles.geometry.attributes.opacity.needsUpdate = true;
        var compositionIndex = Number(element.id.split(' ')[1]);
        if ( compositionArray[compositionIndex-1] instanceof Box && compositionArray[compositionIndex+1] instanceof Box ){
            // reset opacity of all other lines
            for (var i = 0; i < arrowsIDs.length; i++) {
                var lineObject = scene.getObjectByName( arrowsIDs[i] );
                lineObject.material.opacity = 0.1;    
            }
            let linename = "meander "+compositionArray[compositionIndex-1].arrayIndex+' '+compositionArray[compositionIndex+1].arrayIndex;
            var meanderObject = scene.getObjectByName( linename );
            meanderObject.material.opacity = 1;
        }
        // highlight arrow in the scatterplot
    } else if ( element.classList.contains('crossfade') ) {
        element.classList.add('click-on-box');
        var newopacities = new Float32Array( N_POINTS ).fill(0.3);
        particles.geometry.attributes.opacity.array = newopacities;
        particles.geometry.attributes.opacity.needsUpdate = true;
        var compositionIndex = Number(element.id.split(' ')[1]);
        if ( compositionArray[compositionIndex-1] instanceof Box && compositionArray[compositionIndex+1] instanceof Box ){
            // reset opacity of all other lines
            for (var i = 0; i < arrowsIDs.length; i++) {
                var lineObject = scene.getObjectByName( arrowsIDs[i] );
                lineObject.material.opacity = 0.1;    
            }
            let linename = "crossfade "+compositionArray[compositionIndex-1].arrayIndex+' '+compositionArray[compositionIndex+1].arrayIndex;
            var crossfadeObject = scene.getObjectByName( linename );
            crossfadeObject.material.opacity = 1;
        }
        // highlight arrow in the scatterplot
    } else {
        // reset points opacity
        var newopacities = new Float32Array( N_POINTS ).fill(BASE_OPACITY);
        particles.geometry.attributes.opacity.array = newopacities;
        particles.geometry.attributes.opacity.needsUpdate = true;
        // reset lines opacity
        for (var i = 0; i < arrowsIDs.length; i++) {
            var lineObject = scene.getObjectByName( arrowsIDs[i] );
            lineObject.material.opacity = 0.1;
        }
    }
    // de-highlight all other boxes
    var all_click_on_box = document.getElementsByClassName('click-on-box');
    for (var i = 0; i < all_click_on_box.length; i++) {
        if(all_click_on_box[i].id != element.id){
            all_click_on_box[i].classList.remove('click-on-box');
        }
    }
}


// TRANSFER THE BOXES AS OVERLAY OBJECT ON THE 3D INTERFACE
// https://discourse.threejs.org/t/embed-a-div-into-a-scene/2338
/*let aaaaaa = document.createElement("div");
aaaaaa.className = 'overlay';
renderer.domElement.parentNode.appendChild(aaaaaa);*/
