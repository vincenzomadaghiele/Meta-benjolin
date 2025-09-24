import { LatentSpace, sendBox, sendMeander, sendDrawMeander, sendCrossfade, sendStop, sendStartrecording, sendStoprecording } from "osc-communication";
import {datasetJS, p1, p2, p3, p4, p5, p6, p7, p8} from 'datasetJS'
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Benjolin } from "benjolin";

// GRAPHICS GLOBAL PARAMETERS
const COMPOSITION_BAR_WIDTH_PX = 150;
const MARGIN_PX = 20
const SELECTED_OPACITY = 1;
const MIN_OPACITY = 0.3;
const HOVER_OPACITY = 0.6;
const COMPOSITION_BAR_HEIGHT_PX = 1000;
const TIME_TO_POINTSIZE = 0.003;
let raphaels = [];

const buttonOn = document.querySelector('#audioOn');
const volumeControl = document.querySelector("#volume");
const mainContent = document.querySelector("#main-app");
const introScreen = document.querySelector("#intro-screen");
const bar1 = document.querySelector("#bar1");
const bar2 = document.querySelector("#bar2");
const bar3 = document.querySelector("#bar3");
const bar4 = document.querySelector("#bar4");
const bar5 = document.querySelector("#bar5");
const bar6 = document.querySelector("#bar6");
const bar7 = document.querySelector("#bar7");
const bar8 = document.querySelector("#bar8");



const x = datasetJS.x;
const y = datasetJS.y;
const z = datasetJS.z;

// create audio context
let audioContext = new AudioContext()

// activate audio context
buttonOn.addEventListener("click", function (){
    audioContext.resume();
    console.log('starting audio context')
    mainContent.style.opacity = 1.0;
    introScreen.style.opacity = 0.0;
})



// Correctly declare variables in the global scope.
let myBenjolin;

// Declare functions in the global scope for accessibility.
let setBenjolin;
let changeGain;

// Set the slider's event handler immediately.
if (volumeControl) {
    volumeControl.oninput = function (){
        // Only try to change the gain if myBenjolin has been initialized.
        if (myBenjolin) {
            myBenjolin.changeGain(volumeControl.value);
        } else {
            console.log("Benjolin is not yet initialized.");
        }
    };
} else {
    console.error("Volume slider element not found!");
}


async function setupBenjolin() {
  try {
    // Wait for the module to load
    await audioContext.audioWorklet.addModule("benjolin-modules.js");
    
    // Once the module is loaded, create the Benjolin instance.
    // Remember to pass 10 arguments to the constructor.
    myBenjolin = new Benjolin(0, 0, 0, 0, 0, 0, 0, 0, 0, audioContext);
    
    console.log("Benjolin is now initialized and ready to use.");

  } catch (error) {
    console.error("Failed to load audio worklet module:", error);
  }
}

setBenjolin = function (params){
    if (!myBenjolin) {
        console.error("myBenjolin is not yet initialized!");
        return;
    }
    let roundedParams = params.map(param => param.toFixed(2));
    myBenjolin.changeGain(volumeControl.value);
    myBenjolin.change01FRQ(roundedParams[0]);
    myBenjolin.change02FRQ(roundedParams[1]);
    myBenjolin.change01RUN(roundedParams[2]);
    myBenjolin.change02RUN(roundedParams[3]);
    myBenjolin.changeFIL_FRQ(roundedParams[4]);
    myBenjolin.changeFIL_RES(roundedParams[5]);
    myBenjolin.changeFIL_RUN(roundedParams[6]);
    myBenjolin.changeFIL_SWP(roundedParams[7]);

    let intParams = params.map(param => (Math.round(param) / 127) * 100); // map to 0-100 range; 

    bar1.style.width = `${intParams[0]}%`;
    bar2.style.width = `${intParams[1]}%`;
    bar3.style.width = `${intParams[2]}%`;
    bar4.style.width = `${intParams[3]}%`;
    bar5.style.width = `${intParams[4]}%`;
    bar6.style.width = `${intParams[5]}%`;
    bar7.style.width = `${intParams[6]}%`;
    bar8.style.width = `${intParams[7]}%`;

};

changeGain = function (value){
    if (!myBenjolin) {
        console.error("myBenjolin is not yet initialized!");
        return;
    }
    myBenjolin.changeGain(value);
};

// Start the setup process
setupBenjolin();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let stopPlaybackFlag = false;

const playInBackground = async (path, duration) => {
    let interval = duration / path.length;
    let i = 0;
    stopPlaybackFlag = false;
    for (const params of path) {
        if (stopPlaybackFlag) {
            console.log("Playback stopped.");
            break;
        }
        setBenjolin(params);
        i++;
        await delay(interval);
    }
    console.log("Playback complete.");
};


// DRAW TIMELINE
var verticaltimelineheight = window.innerHeight - (90 + 60 + 20);
var R_timeline = Raphael("timeline", 100, verticaltimelineheight );
var path_timeline = R_timeline.path("M25 0L25 "+(verticaltimelineheight)).attr({
    stroke: '#FFFFFF',
    'stroke-width': 1,
    'arrow-end':'classic-wide-long',
    opacity: 0.5
});
var timeline_pathArray = path_timeline.attr("path");
window.addEventListener( 'resize', graphicsOnResize );


var marker1_text = R_timeline.text(43, 10, "0 s").attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'font-size':10, opacity: 0.5});
var marker1_path = R_timeline.path( "M15 0L35 0 ").attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});

var marker12_path = R_timeline.path( "M20 "+(verticaltimelineheight/12)+"L30 "+(verticaltimelineheight/12)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker12_pathArray = marker12_path.attr("path");

var marker2_text = R_timeline.text(43, verticaltimelineheight/6, "10 s").attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'font-size':10, opacity: 0.5});
var marker2_path = R_timeline.path( "M20 "+(verticaltimelineheight/6)+"L30 "+(verticaltimelineheight/6)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker2_pathArray = marker2_path.attr("path");

var marker22_path = R_timeline.path( "M20 "+(verticaltimelineheight*3/12)+"L30 "+(verticaltimelineheight*3/12)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker22_pathArray = marker22_path.attr("path");

var marker3_text = R_timeline.text(43, verticaltimelineheight/6*2-10, "20 s").attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'font-size':10, opacity: 0.5});
var marker3_path = R_timeline.path( "M15 "+(verticaltimelineheight*2/6)+"L35 "+(verticaltimelineheight*2/6)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker3_pathArray = marker3_path.attr("path");

var marker32_path = R_timeline.path( "M20 "+(verticaltimelineheight*5/12)+"L30 "+(verticaltimelineheight*5/12)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker32_pathArray = marker32_path.attr("path");

var marker4_text = R_timeline.text(43, verticaltimelineheight/6*3, "30 s").attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'font-size':10, opacity: 0.5});
var marker4_path = R_timeline.path( "M20 "+(verticaltimelineheight*3/6)+"L30 "+(verticaltimelineheight*3/6)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker4_pathArray = marker4_path.attr("path");

var marker42_path = R_timeline.path( "M20 "+(verticaltimelineheight*7/12)+"L30 "+(verticaltimelineheight*7/12)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker42_pathArray = marker42_path.attr("path");

var marker5_text = R_timeline.text(43, verticaltimelineheight/6*4-10, "40 s").attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'font-size':10, opacity: 0.5});
var marker5_path = R_timeline.path( "M15 "+(verticaltimelineheight*4/6)+"L35 "+(verticaltimelineheight*4/6)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker5_pathArray = marker5_path.attr("path");

var marker52_path = R_timeline.path( "M20 "+(verticaltimelineheight*9/12)+"L30 "+(verticaltimelineheight*9/12)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker52_pathArray = marker52_path.attr("path");

var marker6_text = R_timeline.text(43, verticaltimelineheight/6*5, "50 s").attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'font-size':10, opacity: 0.5});
var marker6_path = R_timeline.path( "M20 "+(verticaltimelineheight*5/6)+"L30 "+(verticaltimelineheight*5/6)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker6_pathArray = marker6_path.attr("path");

var marker62_path = R_timeline.path( "M20 "+(verticaltimelineheight*11/12)+"L30 "+(verticaltimelineheight*11/12)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker62_pathArray = marker62_path.attr("path");

var marker7_text = R_timeline.text(43, verticaltimelineheight-25, "60 s").attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'font-size':10, opacity: 0.5});
var marker7_path = R_timeline.path( "M15 "+(verticaltimelineheight-10)+"L35 "+(verticaltimelineheight-10)).attr({stroke: '#FFFFFF','stroke-width': 1.2, opacity: 0.5});
var marker7_pathArray = marker7_path.attr("path");


// UPDATE WINDOW SIZE
function graphicsOnResize() {
    // update timeline
    let new_timeline_height = window.innerHeight - (90 + 60 + 20);
    R_timeline.setSize(100, new_timeline_height);
    //path_timeline.attr({});
    timeline_pathArray[1][2] = new_timeline_height;
    path_timeline.attr({path: timeline_pathArray});

    marker2_pathArray[0][2] = new_timeline_height/6;
    marker2_pathArray[1][2] = new_timeline_height/6;
    marker2_path.attr({path: marker2_pathArray});
    marker2_text.attr({y: new_timeline_height/6 });

    marker3_pathArray[0][2] = new_timeline_height*2/6;
    marker3_pathArray[1][2] = new_timeline_height*2/6;
    marker3_path.attr({path: marker3_pathArray});
    marker3_text.attr({y: new_timeline_height*2/6 -10});

    marker4_pathArray[0][2] = new_timeline_height*3/6;
    marker4_pathArray[1][2] = new_timeline_height*3/6;
    marker4_path.attr({path: marker4_pathArray});
    marker4_text.attr({y: new_timeline_height*3/6 });

    marker5_pathArray[0][2] = new_timeline_height*4/6;
    marker5_pathArray[1][2] = new_timeline_height*4/6;
    marker5_path.attr({path: marker5_pathArray});
    marker5_text.attr({y: new_timeline_height*4/6 -10});

    marker6_pathArray[0][2] = new_timeline_height*5/6;
    marker6_pathArray[1][2] = new_timeline_height*5/6;
    marker6_path.attr({path: marker6_pathArray});
    marker6_text.attr({y: new_timeline_height*5/6 });

    marker7_pathArray[0][2] = new_timeline_height-10;
    marker7_pathArray[1][2] = new_timeline_height-10;
    marker7_path.attr({path: marker7_pathArray});
    marker7_text.attr({y: new_timeline_height-25 });


    marker12_pathArray[0][2] = new_timeline_height/12;
    marker12_pathArray[1][2] = new_timeline_height/12;
    marker12_path.attr({path: marker12_pathArray});

    marker22_pathArray[0][2] = new_timeline_height*3/12;
    marker22_pathArray[1][2] = new_timeline_height*3/12;
    marker22_path.attr({path: marker22_pathArray});

    marker32_pathArray[0][2] = new_timeline_height*5/12;
    marker32_pathArray[1][2] = new_timeline_height*5/12;
    marker32_path.attr({path: marker32_pathArray});

    marker42_pathArray[0][2] = new_timeline_height*7/12;
    marker42_pathArray[1][2] = new_timeline_height*7/12;
    marker42_path.attr({path: marker42_pathArray});

    marker52_pathArray[0][2] = new_timeline_height*9/12;
    marker52_pathArray[1][2] = new_timeline_height*9/12;
    marker52_path.attr({path: marker52_pathArray});

    marker62_pathArray[0][2] = new_timeline_height*11/12;
    marker62_pathArray[1][2] = new_timeline_height*11/12;
    marker62_path.attr({path: marker62_pathArray});

}

// TIMELINE CURSOR 
let verticalAnimationTimeouts = [];
var timeline_vertical_cursor_global = undefined;
function animateTimelineCursor( start_y, stop_y, animation_time ){
    var timeline_vertical_cursor = R_timeline.circle( 25, start_y, 8 ).attr({
        fill: "#FFFFFF",
        "stroke-width": 10,
        stroke: "transparent",
        opacity: 0.8
    });
    // the interval at which the meander changes position
    let animation_time_granularity = 200;
    let cursortime = 0
    let time_interval = animation_time / animation_time_granularity;
    let space_interval = (stop_y-start_y) / animation_time_granularity;
    //cursor = createCursor( cursor_x1, cursor_y1, cursor_z1 );
    //scene.add(cursor);
    for ( let i = 0; i < animation_time_granularity; i++ ) {
        var animationCursorTimeout = setTimeout(function() {
            let current_y_value = timeline_vertical_cursor.attr("cy");
            current_y_value += space_interval;
            timeline_vertical_cursor.attr("cy", current_y_value);
            timeline_vertical_cursor_global = timeline_vertical_cursor;
        }, cursortime );
        cursortime += time_interval;
        verticalAnimationTimeouts.push(animationCursorTimeout);
    }
    var animationCursorTimeout = setTimeout(function() {
        timeline_vertical_cursor.remove();
        //timeline_vertical_cursor_global.remove();
    }, cursortime );
    verticalAnimationTimeouts.push(animationCursorTimeout);
}


// INTERACTION FLAGS
var SELECTED_ELEMENT = null;
var ISPLAYBACKON = false;
var COMPOSITION_BAR_ISFULL = false;
let QUEUED_TIMEOUTS = []; // all timeouts queued for playback

// COMPOSITION TIMINGS
// window.innerHeight = 514 = 2 min = 120 s
// a radius of 55 means a diameter of 110 --> 110 / 514 = 0.214. multiplied by 120 --> 25.16 s
const BASIC_ELEMENT_T = 5000 // new element when created has duration 5s
const MAX_T = 10000 // max element duration is 20s
const MIN_T = 1000 // min element duration is 1s
const MAX_COMPOSITION_DURATION = 60000 // 12000 milliseconds = 2 minutes

function timesToPxHeight (time_ms) {
    // adaptively calculate element height in pixel corresponding to time in milliseconds
    // window height : max duration = height_px : time_ms
    // dependent on window height
    //let conversion_factor = window.innerHeight / MAX_COMPOSITION_DURATION;
    
    // dependent on set size
    let conversion_factor = COMPOSITION_BAR_HEIGHT_PX / MAX_COMPOSITION_DURATION / 2;
    let height_px = time_ms * conversion_factor;
    return height_px
}
function pxHeightToTimesMs (height_px) {
    // adaptively calculate element height in pixel corresponding to time in milliseconds
    // window height : max duration = height_px : time_ms
    // dependent on window height
    //let time_ms = height_px * MAX_COMPOSITION_DURATION / window.innerHeight;
    // dependent on set size
    let time_ms = height_px * MAX_COMPOSITION_DURATION / COMPOSITION_BAR_HEIGHT_PX * 2;
    return time_ms
}


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
        this.meanderComponents = undefined;
    }
}
class Crossfade{
    constructor(duration){
        this.duration = duration;
    }
}

const compositionArray = [];
let numBoxes = 0;
function calculateCurrentCompostionTime(){
    let compositionTime = 0;
    for (let i = 0; i < compositionArray.length; i++) {
        compositionTime += compositionArray[i].duration
    }
    return compositionTime
}



// BOX --> CIRCLE
function drawBox(boxx, boxy, boxz, colorHue, arrayIndex){
    let compositionTime = calculateCurrentCompostionTime();
    if ( compositionTime < MAX_COMPOSITION_DURATION){
        COMPOSITION_BAR_ISFULL = false;

        let newBox = document.createElement("div");
        newBox.id = "box "+numBoxes;
        newBox.className = 'box';

        // put out of draw box
        document.getElementById("composition-bar").appendChild(newBox); 

        let boxStartHeight = timesToPxHeight( BASIC_ELEMENT_T );
        var R = Raphael("box "+numBoxes, COMPOSITION_BAR_WIDTH_PX, boxStartHeight + MARGIN_PX );
        var s = R.circle( COMPOSITION_BAR_WIDTH_PX/2 , (boxStartHeight + MARGIN_PX) / 2 , boxStartHeight / 2 ).attr({
                fill: "hsb("+colorHue+", .5, .5)",
                stroke: "none",
                opacity: .3
            });
        var c = R.circle( COMPOSITION_BAR_WIDTH_PX/2 , (boxStartHeight + MARGIN_PX) / 2 , boxStartHeight / 2 ).attr({
                fill: "none",
                stroke: "hsb("+colorHue+", 1, 1)",
                "stroke-width": 8,
                opacity: 0.3
            });
        c.sized = s;
        c.parentDiv = document.getElementById(newBox.id);
        c.raph = R;
        c.drag(move, start, up);
        s.outer = c;

        newBox.draggable = 'true';

        // HOVER INTERACTION
        newBox.addEventListener("mouseover", (event) => {
            if ( !ISPLAYBACKON ){
                let item_index = Number(newBox.id.split(" ")[1])
                highlightBox( item_index );
                event.target.style["cursor"] = "pointer";
                textlog.innerHTML="A <b>circle</b> represents a fixed state of the system <br><br> Click on the circle to listen to the corresponding state. <br><br> Drag the border of the circle to increase this state's duration in the composition. <br><br> Drag this element on another one to move it on top of it in the composition bar. ";
            } else {
                event.target.style["cursor"] = "default";
                textlog.innerHTML="Single element selection is disabled during playback.";
            }
        }); 
        // CLICK INTERACTION
        newBox.addEventListener("click", (event) => {
            if ( !ISPLAYBACKON ){
                for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
                    clearTimeout(singlePlaybackTimeouts[i]);
                }
                for (var i = 0; i < meanderPlaybackTimeouts.length; i++) {
                    clearTimeout(meanderPlaybackTimeouts[i]);
                }
                for (var i = 0; i < crossfadePlaybackTimeouts.length; i++) {
                    clearTimeout(crossfadePlaybackTimeouts[i]);
                }
                for (var i = 0; i < verticalAnimationTimeouts.length; i++) {
                    clearTimeout(verticalAnimationTimeouts[i]);
                    timeline_vertical_cursor_global.remove();
                }
                let item_index = Number(newBox.id.split(" ")[1])
                SELECTED_ELEMENT = item_index;
                //highlightBox( item_index ); 
                playBox( item_index );
                textlog.innerHTML="A <b>circle</b> represents a fixed state of the system <br><br> Click on the circle to listen to the corresponding state. <br><br> Drag the border of the circle to increase this state's duration in the composition. <br><br> Drag this element on another one to move it on top of it in the composition bar. ";
            } else {
                textlog.innerHTML="Single element selection is disabled during playback.";
            }
        }); 
        // DRAG AND DROP INTERACTION
        newBox.addEventListener('dragstart', dragStart);
        newBox.addEventListener('dragenter', dragEnter)
        newBox.addEventListener('dragover', dragOver);
        newBox.addEventListener('dragleave', dragLeave);
        newBox.addEventListener('drop', drop);

        var duration = pxHeightToTimesMs(boxStartHeight); 
        compositionArray.push(new Box(boxx, boxy, boxz, duration, arrayIndex));

        numBoxes += 1;
        raphaels.push(R);

        let compositionTime = calculateCurrentCompostionTime();
        if ( compositionTime >= MAX_COMPOSITION_DURATION){ COMPOSITION_BAR_ISFULL = true ; } else { COMPOSITION_BAR_ISFULL = false ; }

    } else {
        COMPOSITION_BAR_ISFULL = true;
    }
    renderPath();
}
// CIRCLE INTERACTIONS
var start = function () {
    if ( !ISPLAYBACKON ){
        this.ISMOVING = true;
        this.ox = this.attr("cx");    
        this.oy = this.attr("cy");
        this.or = this.attr("r");
        this.attr({opacity: 1});
        this.sized.ox = this.sized.attr("cx");    
        this.sized.oy = this.sized.attr("cy");
        this.sized.or = this.attr("r");
        this.sized.attr({opacity: 1});
    }
};
var move = function (dx, dy) {
    if ( !ISPLAYBACKON ){
        let newr = this.or + (dy < 0 ? -1 : 1) * Math.sqrt(2*dy*dy);
        let max_r_px = timesToPxHeight( MAX_T );
        let min_r_px = timesToPxHeight( MIN_T );
        if ( newr < max_r_px/2 && newr > min_r_px/2 ) {
            this.attr({r: newr});
            this.sized.attr({r: newr });
            this.parentDiv.style["height"] = newr*2+MARGIN_PX;
            this.raph.setSize(COMPOSITION_BAR_WIDTH_PX, newr*2+MARGIN_PX);
            this.attr({cy: (newr*2+MARGIN_PX)/2});
            this.sized.attr({cy: (newr*2+MARGIN_PX)/2});
            //resize marker on scatterplot
            let item_index = Number(this.parentDiv.id.split(" ")[1]);
            changePointSize(item_index, newr*2);
        }
    }
};
var up = function () {
    if ( !ISPLAYBACKON ){
        this.ISMOVING = false;
        this.attr({opacity: 0.05 });
        this.sized.attr({opacity: .8 });
        let compositionIndex = Number(this.parentDiv.id.split(" ")[1]);
        compositionArray[compositionIndex].duration = pxHeightToTimesMs(this.attr("r"));

        let compositionTime = calculateCurrentCompostionTime();
        if ( compositionTime >= MAX_COMPOSITION_DURATION){ COMPOSITION_BAR_ISFULL = true ; } else { COMPOSITION_BAR_ISFULL = false ; }
    }
}

// CROSSFADE
function drawCrossfade(){
    let compositionTime = calculateCurrentCompostionTime();
    if ( compositionTime < MAX_COMPOSITION_DURATION){
        COMPOSITION_BAR_ISFULL = false;

        let newBox = document.createElement("div");
        newBox.id = "box "+numBoxes;
        newBox.className = 'crossfade';
        document.getElementById("composition-bar").appendChild(newBox); 

        let boxStartHeight = timesToPxHeight( BASIC_ELEMENT_T );
        // from https://jsfiddle.net/TfE2X/
        var R = Raphael("box "+numBoxes, COMPOSITION_BAR_WIDTH_PX, boxStartHeight+MARGIN_PX);
        var path = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2)+" 0L"+(COMPOSITION_BAR_WIDTH_PX/2)+" "+boxStartHeight).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            'arrow-end':'classic-wide-long',
            opacity: 0.3
        });
        var pathArray = path.attr("path");
        var handle = R.circle(COMPOSITION_BAR_WIDTH_PX/2,boxStartHeight-5,10).attr({
            fill: "#FFFFFF",
            cursor: "pointer",
            "stroke-width": 10,
            stroke: "transparent",
            opacity: 0.3
        });
        handle.pathArray = pathArray;
        handle.path = path;
        handle.parentDiv = document.getElementById(newBox.id);
        handle.raph = R;
        handle.drag(move_crossfade, start_crossfade, up_crossfade);

        newBox.draggable = 'true';

        // HOVER INTERACTION
        newBox.addEventListener("mouseover", (event) => {
            if ( !ISPLAYBACKON ){
                let item_index = Number(newBox.id.split(" ")[1])
                highlightBox(item_index);
                event.target.style["cursor"] = "pointer";
                textlog.innerHTML="A <b>crossfade</b> is a smooth transition between two states of the system. <br><br> CAREFUL: a crossfade has to be placed between two circles, otherwise it will be ignored! <br><br> Drag the handle to increase this crossfade's duration. <br><br> Drag this element on another one to move it on top of it. ";
            } else {
                event.target.style["cursor"] = "default";
                textlog.innerHTML="Single element selection is disabled during playback.";
            }
        }); 
        // CLICK INTERACTION
        newBox.addEventListener("click", (event) => {
            if ( !ISPLAYBACKON ){
                for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
                    clearTimeout(singlePlaybackTimeouts[i]);
                }
                for (var i = 0; i < meanderPlaybackTimeouts.length; i++) {
                    clearTimeout(meanderPlaybackTimeouts[i]);
                }   
                for (var i = 0; i < crossfadePlaybackTimeouts.length; i++) {
                    clearTimeout(crossfadePlaybackTimeouts[i]);
                }
                for (var i = 0; i < verticalAnimationTimeouts.length; i++) {
                    clearTimeout(verticalAnimationTimeouts[i]);
                    timeline_vertical_cursor_global.remove();
                }
                let item_index = Number(newBox.id.split(" ")[1])
                SELECTED_ELEMENT = item_index;
                //highlightBox(item_index); 
                playBox( SELECTED_ELEMENT );
                textlog.innerHTML="A <b>crossfade</b> is a smooth transition between two states of the system. <br><br> CAREFUL: a crossfade has to be placed between two circles, otherwise it will be ignored! <br><br> Drag the handle to increase this crossfade's duration. <br><br> Drag this element on another one to move it on top of it. ";
            } else {
                textlog.innerHTML="Single element selection is disabled during playback.";
            }
        });
        // DRAG AND DROP INTERACTION
        newBox.addEventListener('dragstart', dragStart);
        newBox.addEventListener('dragenter', dragEnter)
        newBox.addEventListener('dragover', dragOver);
        newBox.addEventListener('dragleave', dragLeave);
        newBox.addEventListener('drop', drop);

        var duration = pxHeightToTimesMs(newBox.clientHeight); 
        compositionArray.push(new Crossfade(duration));

        numBoxes += 1;
        raphaels.push(R);

        let compositionTime = calculateCurrentCompostionTime();
        if ( compositionTime >= MAX_COMPOSITION_DURATION){ COMPOSITION_BAR_ISFULL = true ; } else { COMPOSITION_BAR_ISFULL = false ; }

    } else {
        COMPOSITION_BAR_ISFULL = true;
    }
    renderPath();
}
// CROSSFADE INTERACTIONS
var start_crossfade = function () {
    if ( !ISPLAYBACKON ){

        this.cy = this.attr("cy");
        this.attr({opacity: 1});
    }
};
var move_crossfade = function (dx, dy) {
    if ( !ISPLAYBACKON ){

        var Y = this.cy + dy;
        let max_r_px = timesToPxHeight( MAX_T );
        let min_r_px = timesToPxHeight( MIN_T );
        if ( Y < max_r_px && Y > min_r_px ) {
            this.attr({ cy: Y });
            this.pathArray[1][2] = Y;
            this.path.attr({path: this.pathArray});
            this.parentDiv.style["height"] = Y+MARGIN_PX;
            this.raph.setSize(COMPOSITION_BAR_WIDTH_PX, Y+MARGIN_PX);
        }
    }
};
var up_crossfade = function () {
    if ( !ISPLAYBACKON ){
        this.attr({opacity: 0.3});
        let compositionIndex = Number(this.parentDiv.id.split(" ")[1]);
        compositionArray[compositionIndex].duration = pxHeightToTimesMs(this.attr("cy"));
        let compositionTime = calculateCurrentCompostionTime();
        if ( compositionTime >= MAX_COMPOSITION_DURATION){ COMPOSITION_BAR_ISFULL = true ; } else { COMPOSITION_BAR_ISFULL = false ; }

    }
};


function drawMeander(){
    let compositionTime = calculateCurrentCompostionTime();
    if ( compositionTime < MAX_COMPOSITION_DURATION){
        COMPOSITION_BAR_ISFULL = false;

        let newBox = document.createElement("div");
        newBox.id = "box "+numBoxes;
        newBox.className = 'meander';
        document.getElementById("composition-bar").appendChild(newBox); 

        let boxStartHeight = timesToPxHeight( BASIC_ELEMENT_T );
        var R = Raphael("box "+numBoxes, COMPOSITION_BAR_WIDTH_PX, boxStartHeight+MARGIN_PX);
        let path1 = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2)+" 0L"+(COMPOSITION_BAR_WIDTH_PX/2+15)+" "+ (boxStartHeight/4)).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            opacity: 0.3
        });
        let path2 = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2+15)+" "+(boxStartHeight/4)+"L"+(COMPOSITION_BAR_WIDTH_PX/2-15)+" "+(boxStartHeight*2/4)).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            opacity: 0.3
        });
        let path3 = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2-15)+" "+(boxStartHeight*2/4)+"L"+(COMPOSITION_BAR_WIDTH_PX/2)+" "+(boxStartHeight*3/4)).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            opacity: 0.3
        });
        let path4 = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2)+" "+(boxStartHeight*3/4)+"L"+(COMPOSITION_BAR_WIDTH_PX/2)+" "+boxStartHeight).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            'arrow-end':'classic-wide-long',
            opacity: 0.3
        });

        var pathArray1 = path1.attr("path");
        var pathArray2 = path2.attr("path");
        var pathArray3 = path3.attr("path");
        var pathArray4 = path4.attr("path");
        let handle_meander = R.circle(COMPOSITION_BAR_WIDTH_PX/2,boxStartHeight-5,10).attr({
            fill: "#FFFFFF",
            cursor: "pointer",
            "stroke-width": 10,
            stroke: "transparent",
            opacity: 0.3
        });
        handle_meander.pathArray1 = pathArray1;
        handle_meander.pathArray2 = pathArray2;
        handle_meander.pathArray3 = pathArray3;
        handle_meander.pathArray4 = pathArray4;
        handle_meander.path1 = path1;
        handle_meander.path2 = path2;
        handle_meander.path3 = path3;
        handle_meander.path4 = path4;
        handle_meander.parentDiv = document.getElementById("box "+numBoxes);
        handle_meander.raph = R;
        handle_meander.drag(move_meander, start_meander, up_meander);

        newBox.draggable = 'true';

        // HOVER INTERACTION
        newBox.addEventListener("mouseover", (event) => {
            if ( !ISPLAYBACKON ){
                let item_index = Number(newBox.id.split(" ")[1])
                highlightBox(item_index);
                event.target.style["cursor"] = "pointer";
                textlog.innerHTML="A <b>meander</b> is a transition between two states of the system going through other states.<br><br> CAREFUL: a meander has to be placed between two circles, otherwise it will be ignored!  <br><br> Drag the handle to increase this meander's duration. <br><br> Drag this element on another one to move it on top of it.";
            } else {
                event.target.style["cursor"] = "default";
                textlog.innerHTML="Single element selection is disabled during playback.";

            }
        }); 
        // CLICK INTERACTION
        newBox.addEventListener("click", (event) => {
            if ( !ISPLAYBACKON ){
                for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
                    clearTimeout(singlePlaybackTimeouts[i]);
                }            
                for (var i = 0; i < meanderPlaybackTimeouts.length; i++) {
                    clearTimeout(meanderPlaybackTimeouts[i]);
                }
                for (var i = 0; i < crossfadePlaybackTimeouts.length; i++) {
                    clearTimeout(crossfadePlaybackTimeouts[i]);
                }
                for (var i = 0; i < verticalAnimationTimeouts.length; i++) {
                    clearTimeout(verticalAnimationTimeouts[i]);
                    timeline_vertical_cursor_global.remove();
                }
                let item_index = Number(newBox.id.split(" ")[1])
                SELECTED_ELEMENT = item_index;
                //highlightBox(item_index); 
                playBox( SELECTED_ELEMENT );
                textlog.innerHTML="A <b>meander</b> is a transition between two states of the system going through other states.<br><br> CAREFUL: a meander has to be placed between two circles, otherwise it will be ignored!  <br><br> Drag the handle to increase this meander's duration. <br><br> Drag this element on another one to move it on top of it.";
            } else {
                textlog.innerHTML="Single element selection is disabled during playback.";
            }
        }); 
        // DRAG AND DROP INTERACTION
        newBox.addEventListener('dragstart', dragStart);
        newBox.addEventListener('dragenter', dragEnter)
        newBox.addEventListener('dragover', dragOver);
        newBox.addEventListener('dragleave', dragLeave);
        newBox.addEventListener('drop', drop);


        var duration = pxHeightToTimesMs(newBox.clientHeight); 
        compositionArray.push(new Meander(duration));

        numBoxes += 1;
        raphaels.push(R);

        let compositionTime = calculateCurrentCompostionTime();
        if ( compositionTime >= MAX_COMPOSITION_DURATION){ COMPOSITION_BAR_ISFULL = true ; } else { COMPOSITION_BAR_ISFULL = false ; }

    } else {
        COMPOSITION_BAR_ISFULL = true;
    }
    renderPath();
}


var start_meander = function () {
    if ( !ISPLAYBACKON ){
        this.cy = this.attr("cy");
        this.attr({opacity: 1});
    }
};
var move_meander = function (dx, dy) {
    if ( !ISPLAYBACKON ){
        var Y = this.cy + dy;
        let max_r_px = timesToPxHeight( MAX_T );
        let min_r_px = timesToPxHeight( MIN_T );
        if ( Y < max_r_px && Y > min_r_px ) {
            this.attr({ cy: Y });
            this.pathArray1[1][2] = Y/4;
            this.pathArray2[0][2] = Y/4;
            this.pathArray2[1][2] = Y/4*2;
            this.pathArray3[0][2] = Y/4*2;
            this.pathArray3[1][2] = Y/4*3;
            this.pathArray4[0][2] = Y/4*3;
            this.pathArray4[1][2] = Y;
            this.path1.attr({path: this.pathArray1});
            this.path2.attr({path: this.pathArray2});
            this.path3.attr({path: this.pathArray3});
            this.path4.attr({path: this.pathArray4});
            this.parentDiv.style["height"] = Y+MARGIN_PX;
            this.raph.setSize(COMPOSITION_BAR_WIDTH_PX, Y+MARGIN_PX);
        }
    }
};
var up_meander = function () {
    if ( !ISPLAYBACKON ){
        this.attr({opacity: 0.3});
        let compositionIndex = Number(this.parentDiv.id.split(" ")[1]);
        compositionArray[compositionIndex].duration = pxHeightToTimesMs(this.attr("cy"));
        let compositionTime = calculateCurrentCompostionTime();
        if ( compositionTime >= MAX_COMPOSITION_DURATION){ COMPOSITION_BAR_ISFULL = true ; } else { COMPOSITION_BAR_ISFULL = false ; }
    }
};


// DEMO OBJECTS (WHEN BOXES ARE EXCHANGED NEEDS TO BE EXCHANGED IN "raphaels")
//drawBox(0, 0, 0, Math.random(), 10000);
//drawCrossfade();
//drawBox(0, 0, 0, Math.random(), 10000);
//drawMeander();
//drawBox(0, 0, 0, Math.random(), 10000);



// FUNCTION FOR HIGHLIGHTING BOXES
function highlightNone (){
    //var hovered_on_id = Number(event.target.id.split(' ')[1]);
    for (var i = 0; i < raphaels.length; i++) {
        raphaels[i].forEach(function (el) 
        {
            el.attr({"opacity": MIN_OPACITY});
        });
    }
    if ( SELECTED_ELEMENT != null ){
        raphaels[SELECTED_ELEMENT].forEach(function (el) 
        {
            el.attr({"opacity": SELECTED_OPACITY});
        });
        var newopacities = new Float32Array( N_POINTS ).fill(0.2);
        newopacities[compositionArray[SELECTED_ELEMENT].arrayIndex] = 1;
        particles.geometry.attributes.opacity.array = newopacities;
        particles.geometry.attributes.opacity.needsUpdate = true;

    } else {
        var newopacities = new Float32Array( N_POINTS ).fill(BASE_OPACITY);
        particles.geometry.attributes.opacity.array = newopacities;
        particles.geometry.attributes.opacity.needsUpdate = true;

        for (var i = 0; i < meanderPlaybackTimeouts.length; i++) {
            clearTimeout(meanderPlaybackTimeouts[i]);
        }
        for (var i = 0; i < crossfadePlaybackTimeouts.length; i++) {
            clearTimeout(crossfadePlaybackTimeouts[i]);
        }
        for (var i = 0; i < verticalAnimationTimeouts.length; i++) {
            clearTimeout(verticalAnimationTimeouts[i]);
            timeline_vertical_cursor_global.remove();
        }
        scene.remove(cursor);
    
    }
}

function highlightBox (box_n){
    var newopacities = new Float32Array( N_POINTS ).fill(0.2);
    
    for (var i = 0; i < raphaels.length; i++) {
        raphaels[i].forEach(function (el) 
        {
            el.attr({"opacity": MIN_OPACITY});
        });
    }
    raphaels[box_n].forEach(function (el) 
    {
        el.attr({"opacity": HOVER_OPACITY});
    });
    newopacities[compositionArray[box_n].arrayIndex] = SELECTED_OPACITY;
    if ( SELECTED_ELEMENT != null ){
        raphaels[SELECTED_ELEMENT].forEach(function (el) 
        {
            el.attr({"opacity": SELECTED_OPACITY});
        });

        // highlight dot in the scatterplot
        //var newopacities = new Float32Array( N_POINTS ).fill(0.3);
        //var compositionIndex = Number(element.id.split(' ')[1]);
        newopacities[compositionArray[SELECTED_ELEMENT].arrayIndex] = 1;
    }
    particles.geometry.attributes.opacity.array = newopacities;
    particles.geometry.attributes.opacity.needsUpdate = true;

}

function highlightAll (){    
    for (var i = 0; i < raphaels.length; i++) {
        raphaels[i].forEach(function (el) 
        {
            el.attr({"opacity": HOVER_OPACITY});
        });
    }
    var newopacities = new Float32Array( N_POINTS ).fill(0.2);
    for (var i = 0; i < compositionArray.length; i++) {
        if ( compositionArray[i] instanceof Box ){
            newopacities[compositionArray[i].arrayIndex] = 1;
        }
    }
    particles.geometry.attributes.opacity.array = newopacities;
    particles.geometry.attributes.opacity.needsUpdate = true;
}


const singlePlaybackTimeouts = [];
function loopCrossfade( box_n ){
    let params = sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y, compositionArray[box_n-1].z);
    setBenjolin(params);
    let path = sendCrossfade(compositionArray[box_n-1].x, compositionArray[box_n-1].y, compositionArray[box_n-1].z, 
        compositionArray[box_n+1].x, compositionArray[box_n+1].y, compositionArray[box_n+1].z, 
        compositionArray[box_n].duration / 1000);
    playInBackground(path, compositionArray[box_n].duration);
    animateCrossfade( compositionArray[box_n-1].x,compositionArray[box_n-1].y,compositionArray[box_n-1].z,   
        compositionArray[box_n+1].x,compositionArray[box_n+1].y,compositionArray[box_n+1].z, 
        compositionArray[box_n].duration );
    animateBoxVerticalCursor( box_n );
    var selectedBoxTimeout = setTimeout(function() {
        if ( SELECTED_ELEMENT != null ){
            loopCrossfade( box_n );
        } 
    }, compositionArray[box_n].duration );
    singlePlaybackTimeouts.push(selectedBoxTimeout);
}

function loopMeander( box_n ){
    let params = sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y, compositionArray[box_n-1].z);
    setBenjolin(params);
    let path = sendMeander(compositionArray[box_n-1].x, compositionArray[box_n-1].y, compositionArray[box_n-1].z, 
        compositionArray[box_n+1].x, compositionArray[box_n+1].y, compositionArray[box_n+1].z, 
        compositionArray[box_n].duration / 1000);
    playInBackground(path, compositionArray[box_n].duration);
    animateMeander( compositionArray[box_n].meanderComponents, compositionArray[box_n].duration );
    animateBoxVerticalCursor( box_n );
    var selectedBoxTimeout = setTimeout(function() {
        if ( SELECTED_ELEMENT != null ){
            loopMeander( box_n );
        } 
    }, compositionArray[box_n].duration );
    singlePlaybackTimeouts.push(selectedBoxTimeout);
}

function loopBox( box_n ){
    let params = sendBox( compositionArray[box_n].x, compositionArray[box_n].y, compositionArray[box_n].z );
    setBenjolin(params);
    let cursor_x = Number(compositionArray[box_n].x) * scale_x - (scale_x/2),
        cursor_y = Number(compositionArray[box_n].y) * scale_y - (scale_y/2),
        cursor_z = Number(compositionArray[box_n].z) * scale_z - (scale_z/2);
    cursor = createCursor( cursor_x, cursor_y, cursor_z );
    scene.add(cursor);
    animateBoxVerticalCursor( box_n );
    var selectedBoxTimeout = setTimeout(function() {
        if ( SELECTED_ELEMENT != null ){
            loopBox( box_n );
        } 
    }, compositionArray[box_n].duration );
    singlePlaybackTimeouts.push(selectedBoxTimeout);
}

function animateBoxVerticalCursor( box_n ){
    let playbackduration = compositionArray[box_n].duration;
    let cumulativeDuration = 0;
    for (var i = 0; i < box_n; i++) {
        cumulativeDuration += compositionArray[i].duration;
    }
    let mult_factor = 0.95;
    let total_bar_length_px = (window.innerHeight - (90 + 60 + 20)) * mult_factor;
    let start_px_y_bar = (cumulativeDuration) * total_bar_length_px / MAX_COMPOSITION_DURATION;
    let stop_px_y_bar = (cumulativeDuration + compositionArray[box_n].duration) * total_bar_length_px / MAX_COMPOSITION_DURATION;
    // calculate cumulative duration up to this box from composition array and divide by timeline length
    animateTimelineCursor( start_px_y_bar, stop_px_y_bar, playbackduration );
}

function playBox( box_n ){
    // remove cursor
    scene.remove(cursor);
    if ( compositionArray[box_n] instanceof Box ){
        highlightBox( box_n );
        if ( !ISPLAYBACKON ){
            // loop the box
            loopBox( box_n );
        } else {
            let params = sendBox( compositionArray[box_n].x, compositionArray[box_n].y, compositionArray[box_n].z );
            setBenjolin(params);
            let cursor_x = Number(compositionArray[box_n].x) * scale_x - (scale_x/2),
                cursor_y = Number(compositionArray[box_n].y) * scale_y - (scale_y/2),
                cursor_z = Number(compositionArray[box_n].z) * scale_z - (scale_z/2);
            cursor = createCursor( cursor_x, cursor_y, cursor_z );
            scene.add(cursor);
            animateBoxVerticalCursor( box_n );
        }
    } else if ( box_n != 0 && compositionArray[box_n] instanceof Crossfade ) {
        // check if before and after there are boxes
        if (compositionArray[box_n-1] instanceof Box && compositionArray[box_n+1] instanceof Box){
            highlightBox( box_n );
            if ( !ISPLAYBACKON ){
                // loop the crossfade
                loopCrossfade( box_n );

            } else {
                // play crossfade only once
                let params = sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y, compositionArray[box_n-1].z);
                setBenjolin(params);
                let path = sendCrossfade(compositionArray[box_n-1].x, compositionArray[box_n-1].y, compositionArray[box_n-1].z, 
                    compositionArray[box_n+1].x, compositionArray[box_n+1].y, compositionArray[box_n+1].z, 
                    compositionArray[box_n].duration / 1000);
                playInBackground(path, compositionArray[box_n].duration);
                animateCrossfade( compositionArray[box_n-1].x,compositionArray[box_n-1].y,compositionArray[box_n-1].z,   
                                compositionArray[box_n+1].x,compositionArray[box_n+1].y,compositionArray[box_n+1].z, 
                                compositionArray[box_n].duration );
                animateBoxVerticalCursor( box_n );

            }    
        } else {
            console.log('Crossfade can only by played if it is placed between two circles');
            textlog.innerHTML="A crossfade can only by played if it is placed between two circles";
        }

    } else if ( box_n != 0 && compositionArray[box_n] instanceof Meander ) {
        // check if before and after there are boxes
        if (compositionArray[box_n-1] instanceof Box && compositionArray[box_n+1] instanceof Box){
            highlightBox( box_n );
            if ( !ISPLAYBACKON ){
                // loop the meander
                loopMeander( box_n );
                
            } else {
                // play meander only once
                let params = sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y, compositionArray[box_n-1].z);
                setBenjolin(params);
                let path = sendMeander(compositionArray[box_n-1].x, compositionArray[box_n-1].y, compositionArray[box_n-1].z, 
                    compositionArray[box_n+1].x, compositionArray[box_n+1].y, compositionArray[box_n+1].z, 
                    compositionArray[box_n].duration / 1000);
                playInBackground(path, compositionArray[box_n].duration);
                animateMeander( compositionArray[box_n].meanderComponents, compositionArray[box_n].duration );
                animateBoxVerticalCursor( box_n );
            }    
        } else {
            console.log('Meander can only by played if it placed is between two circles');
            textlog.innerHTML="A meander can only by played if it is placed between two circles";
        }
    }
}




// INTERACTIONS AT BUTTONS
document.getElementById("insert-crossfade").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        event.target.style["cursor"] = "pointer";
        textlog.innerHTML="Insert a new <b>crossfade</b>. <br><br> A <b>crossfade</b> is a smooth transition between two states of the system. <br><br> Place the newly created crossfade between two circles.";
    } else {
        textlog.innerHTML="Insert crossfade function is disabled during playback.";
        event.target.style["cursor"] = "default";
    }
}); 
document.getElementById("insert-crossfade").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        SELECTED_ELEMENT = null;
        highlightNone(); 
        drawCrossfade();
        textlog.innerHTML="Insert a new <b>crossfade</b>. <br><br> A <b>crossfade</b> is a smooth transition between two states of the system. <br><br> Place the newly created crossfade between two circles.";
    } else {
        textlog.innerHTML="Insert crossfade function is disabled during playback.";
        event.target.style["cursor"] = "default";
    }
}); 

// INSERT MEANDER BUTTON
document.getElementById("insert-meander").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){    
        highlightNone(); 
        event.target.style["cursor"] = "pointer";
        textlog.innerHTML="Insert a new <b>meander</b>. <br><br> A <b>meander</b> is a transition between two states of the system going through other states. <br><br> Place the newly created meander between two circles. ";
    } else {
        textlog.innerHTML="Insert meander function is disabled during playback.";
        event.target.style["cursor"] = "default";

    }
}); 
document.getElementById("insert-meander").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        SELECTED_ELEMENT = null;
        highlightNone(); 
        drawMeander();
        // recieveMeander();
        textlog.innerHTML="Insert a new <b>meander</b>. <br><br> A <b>meander</b> is a transition between two states of the system going through other states. <br><br> Place the newly created meander between two circles. ";
    } else {
        textlog.innerHTML="Insert meander function is disabled during playback.";
        event.target.style["cursor"] = "default";
    }
}); 

// TRASH BIN BUTTON
document.getElementById("bin").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        event.target.style["cursor"] = "pointer";
        textlog.innerHTML="Delete selected element. ";
    } else {
        textlog.innerHTML="Delete element function is disabled during playback.";
        event.target.style["cursor"] = "default";

    }
}); 
document.getElementById("bin").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        if ( SELECTED_ELEMENT != null ){
            // trash the element
            removeElement(SELECTED_ELEMENT)
            textlog.innerHTML="Delete selected element.";
        } else {
            textlog.innerHTML="Select an element to delete it";
        }
        SELECTED_ELEMENT = null;
        highlightNone(); 
    } else {
        textlog.innerHTML="Delete element function is disabled during playback.";
        event.target.style["cursor"] = "default";
    }
    let compositionTime = calculateCurrentCompostionTime();
    if ( compositionTime >= MAX_COMPOSITION_DURATION){ COMPOSITION_BAR_ISFULL = true ; } else { COMPOSITION_BAR_ISFULL = false ; }
}); 

function removeElement(element_index){
    
    let element = document.getElementById('box '+ element_index)
    let parent = element.parentNode
    console.log('removing element: ', element);
    // reduce number of boxes
    element.remove();
    numBoxes -= 1;
    // adjust IDs of remaining boxes
    for (var i = element_index; i < numBoxes; i++) {
        var old_id = parent.children[i].id.split(' ');
        old_id[1] = Number(old_id[1])-1;
        parent.children[i].id = old_id.join(' ');
    }
    if (compositionArray[element_index] instanceof Box){
        pointToBasic(compositionArray[element_index].arrayIndex);
        // remove scatterplot element
    }
    // remove item from composition array
    //let comp_index = Number(id_draggable.split(' ')[1]);
    compositionArray.splice(element_index, 1);
    // remove raphael item from canvas array
    raphaels.splice(element_index, 1);
    console.log("composition: ", compositionArray);
    // update visualization
    renderPath();

}

// PLAY BUTTON
document.getElementById("play").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){
        highlightAll(); 
        event.target.style["cursor"] = "pointer";
        textlog.innerHTML="Play the whole composition.";
    } else {
        textlog.innerHTML="Playback function is already executing.";
        event.target.style["cursor"] = "default";

    }
}); 
document.getElementById("play").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        SELECTED_ELEMENT = null;
        play();
        textlog.innerHTML="Play the whole composition.";
    } else {
        textlog.innerHTML="Playback function is already executing.";
        event.target.style["cursor"] = "default";

    }
}); 

var play = function(){
    var timeout = 0;
    ISPLAYBACKON = true;
    disableAllInteractions();
    console.log("playing composition: ", compositionArray);
    for (let i = 0; i < compositionArray.length; i++) {
        let newtimeout = setTimeout(function() {
            if( ISPLAYBACKON ){
                console.log('playing: ',compositionArray[i]);
                SELECTED_ELEMENT = i;
                //highlightBox(i);
                playBox(i);
                //sendBox(compositionArray[i].x, compositionArray[i].y);
                //highlightBoxElement(document.getElementById('box '+i)); 
            }
        }, timeout);
        timeout += (compositionArray[i].duration );
        QUEUED_TIMEOUTS.push(newtimeout);
        //console.log(timeout);
    }
    let newtimeout = setTimeout(function() {
        if( ISPLAYBACKON ){
            console.log('End of composition');
            stopPlayback();
        }
    }, timeout+100);
    QUEUED_TIMEOUTS.push(newtimeout);
};

function disableAllInteractions(){
    document.getElementById("insert-crossfade").disabled = true;
    document.getElementById("insert-meander").disabled = true;
    document.getElementById("bin").disabled = true;
    document.getElementById("play").disabled = true;
    document.getElementById("record").disabled = true;
    document.getElementById("download").disabled = true;

    for (var i = 0; i < numBoxes; i++) {
        let thisbox = document.getElementById("box "+i);
        thisbox.draggable = false;
    }
    for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
        clearTimeout(singlePlaybackTimeouts[i]);
    }
    for (var i = 0; i < meanderPlaybackTimeouts.length; i++) {
        clearTimeout(meanderPlaybackTimeouts[i]);
    }
    for (var i = 0; i < crossfadePlaybackTimeouts.length; i++) {
        clearTimeout(crossfadePlaybackTimeouts[i]);
    }
    for (var i = 0; i < verticalAnimationTimeouts.length; i++) {
        clearTimeout(verticalAnimationTimeouts[i]);
        timeline_vertical_cursor_global.remove();
    }
}

// STOP BUTTON
document.getElementById("stop").addEventListener("mouseover", (event) => {
    highlightNone(); 
    event.target.style["cursor"] = "pointer";
    textlog.innerHTML="Stop playback or recording.";
}); 
document.getElementById("stop").addEventListener("click", (event) => {
    highlightNone(); 
    SELECTED_ELEMENT = null;
    stopPlayback();
    textlog.innerHTML="Stop playback or recording.";
}); 

var stopPlayback = function(){
    console.log("stopped composition playback");
    for (var i = 0; i < QUEUED_TIMEOUTS.length; i++) {
        clearTimeout(QUEUED_TIMEOUTS[i]);
    }
    for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
        clearTimeout(singlePlaybackTimeouts[i]);
    }
    for (var i = 0; i < meanderPlaybackTimeouts.length; i++) {
        clearTimeout(meanderPlaybackTimeouts[i]);
    }
    for (var i = 0; i < crossfadePlaybackTimeouts.length; i++) {
        clearTimeout(crossfadePlaybackTimeouts[i]);
    }
    for (var i = 0; i < verticalAnimationTimeouts.length; i++) {
        clearTimeout(verticalAnimationTimeouts[i]);
        timeline_vertical_cursor_global.remove();
    }
    // sendStop();
    changeGain(0);
    stopPlaybackFlag = true;
    SELECTED_ELEMENT = null;
    ISPLAYBACKON = false;
    if ( ISRECORDING ){
        console.log('Stopping recording, file saved to disk');
        sendStoprecording();
        ISRECORDING = false;
        clearTimeout(stoprecordingtimeout);
    }
    highlightNone();
    enableAllInteractions();
    // sendStop();
    changeGain(0);
}
function enableAllInteractions(){
    document.getElementById("insert-crossfade").disabled = false;
    document.getElementById("insert-meander").disabled = false;
    document.getElementById("bin").disabled = false;
    document.getElementById("play").disabled = false;
    document.getElementById("record").disabled = false;
    document.getElementById("download").disabled = false;
    for (var i = 0; i < numBoxes; i++) {
        let thisbox = document.getElementById("box "+i);
        thisbox.draggable = true;
    }
}

// RECORD BUTTON
let ISRECORDING = false;
let stoprecordingtimeout = undefined;
document.getElementById("record").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){
        highlightAll(); 
        event.target.style["cursor"] = "pointer";
        textlog.innerHTML="Record the whole composition. An audio recording of the composition will be saved to the disk.";
    } else {
        textlog.innerHTML="Recording function is disabled during playback.";
        event.target.style["cursor"] = "default";

    }
}); 
document.getElementById("record").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        SELECTED_ELEMENT = null;
        console.log('Starting recording');
        sendStartrecording();
        play();
        ISRECORDING = true;
        let maxrecordingduration = calculateCurrentCompostionTime();
        stoprecordingtimeout = setTimeout(function() {
            if( ISRECORDING ){
                console.log('Stopping recording, file saved to disk');
                sendStoprecording();
                ISRECORDING = false;
            }
        }, maxrecordingduration+100);
        textlog.innerHTML="Record the whole composition. An audio recording of the composition will be saved to the disk.";
    } else {
        textlog.innerHTML="Recording function is disabled during playback.";
        event.target.style["cursor"] = "default";

    }
}); 

// DOWNLOAD BUTTON
document.getElementById("download").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        event.target.style["cursor"] = "pointer";
        textlog.innerHTML="Download the composition as a JSON file.";
    } else {
        textlog.innerHTML="You can't download during playback.";
        event.target.style["cursor"] = "default";

    }
}); 
document.getElementById("download").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        SELECTED_ELEMENT = null;
        //play();
        const myFile = new File([JSON.stringify(compositionArray, null, 2)], 'benjolin-composition.json');
        //console.log(JSON.stringify(compositionArray));

        // Create a link and set the URL using `createObjectURL`
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(myFile);
        link.download = myFile.name;

        // It needs to be added to the DOM so it can be clicked
        document.body.appendChild(link);
        link.click();

        // To make this work on Firefox we need to wait
        // a little while before removing it.
        setTimeout(() => {
            URL.revokeObjectURL(link.href);
            link.parentNode.removeChild(link);
        }, 0);
        textlog.innerHTML="Downloading the composition as a JSON file.";
    } else {
        textlog.innerHTML="Download function is disabled during playback.";
        event.target.style["cursor"] = "default";

    }
}); 

/*
document.getElementById("remove-all").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        event.target.style["cursor"] = "pointer";
        textlog.innerHTML="Remove all composition and start from scratch.";
    } else {
        textlog.innerHTML="Insert crossfade function is disabled during playback.";
        event.target.style["cursor"] = "default";
    }
}); 
document.getElementById("remove-all").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        SELECTED_ELEMENT = null;
        highlightNone(); 
        removeAll();
        textlog.innerHTML="Remove all composition and start from scratch.";
    } else {
        textlog.innerHTML="Remove all function is disabled during playback.";
        event.target.style["cursor"] = "default";
    }
}); 

function removeAll(){
    // erase composition array
    // remove points from scatterplot
    // divs from composition bar
    // remove all raphaels
    // all counts to 0
}
*/


// SCATTERPLOT HOVER
document.getElementById("scatterPlot").addEventListener("mouseover", (event) => {
    highlightNone(); 
    if ( SELECTED_ELEMENT != null ){
        if ( !ISPLAYBACKON ){
            textlog.innerHTML="An object is selected. Click anywhere to go back to exploration.";
        }
    } else {
        if ( COMPOSITION_BAR_ISFULL ){
            textlog.innerHTML="The maximum composition time has been reached, it is not possible to add more elements to the composition bar. <br><br> Delete an element to modify the composition. ";
        } else {
            textlog.innerHTML="Explore the cloud to listen to the different states of the system. <br><br> Click on a point to add the corresponding state to the composition bar. <br> A state is represented as a circle in the composition bar. ";
        }
    }
}); 

let canClick = false;
let mouseMoved = false;
var downListener = function(){
    mouseMoved = false;
}
var moveListener = function(){
    mouseMoved = true;
}
var upListener = function(){
    if ( mouseMoved ){
        // drag
        if ( !ISPLAYBACKON ){
            if ( SELECTED_ELEMENT != null ){
                textlog.innerHTML="An object is selected. Click anywhere to go back to exploration.";
            } else {
                if ( COMPOSITION_BAR_ISFULL ){
                    textlog.innerHTML="The maximum composition time has been reached, it is not possible to add more elements to the composition bar. <br><br> Delete an element to modify the composition. ";
                } else {
                    textlog.innerHTML="Explore the cloud to listen to the different states of the system. <br><br> Click on a point to add the corresponding state to the composition bar. <br> A state is represented as a circle in the composition bar. ";
                }
            }
        } else {
            textlog.innerHTML="Selection is disabled during playback.";
        }
    } else {
        if ( !ISPLAYBACKON ){
            // click
            if ( SELECTED_ELEMENT != null ){
                // disable listening to previous point
                SELECTED_ELEMENT = null;
                highlightNone(); 
                // sendStop();
                changeGain(0);
                if ( COMPOSITION_BAR_ISFULL ){
                    textlog.innerHTML="The maximum composition time has been reached, it is not possible to add more elements to the composition bar. <br><br> Delete an element to modify the composition. ";
                } else {
                    textlog.innerHTML="Explore the cloud to listen to the different states of the system. <br><br> Click on a point to add the corresponding state to the composition bar. <br> A state is represented as a circle in the composition bar. ";
                }
                
            } else {
                // you can select a new point when there is no selected point already
                canClick = true;
                if ( COMPOSITION_BAR_ISFULL ){
                    textlog.innerHTML="The maximum composition time has been reached, it is not possible to add more elements to the composition bar. <br><br> Delete an element to modify the composition. ";
                } else {
                    textlog.innerHTML="Explore the cloud to listen to the different states of the system. <br><br> Click on a point to add the corresponding state to the composition bar. <br> A state is represented as a circle in the composition bar. ";
                }

            }
        }
    }
}
document.getElementById("scatterPlot").addEventListener("mousedown", downListener);
document.getElementById("scatterPlot").addEventListener("mousemove", moveListener);
document.getElementById("scatterPlot").addEventListener("mouseup", upListener);


// SCATTERPLOT CLICK
//document.getElementById("scatterPlot").addEventListener("click", (event) => {
    // distinguish click from dragging
//    SELECTED_ELEMENT = null;
//    highlightNone(event); 
//});


// dragging and dropping boxes
function dragStart(e) {
    //console.log("dragging: ", e.target.id);
    e.dataTransfer.setData('text/plain', e.target.id);
    event.target.style["cursor"] = "grabbing";
    textlog.innerHTML="Dragging element. Release the element on another one to move the selected one on top of the other in the compostion bar.";
}

function dragEnter(e) {
    e.preventDefault();
    let entered_box_n = null;
    if ( e.target.nodeName == 'DIV' ){
        entered_box_n = Number(e.target.id.split(" ")[1]);
    } else if ( e.target.nodeName == 'svg' ){
        entered_box_n = Number(e.target.parentElement.id.split(" ")[1]);
    } else {
        entered_box_n = Number(e.target.parentElement.parentElement.id.split(" ")[1]);
    }
    //console.log("entering: box ", entered_box_n);

    if ( entered_box_n != null ){
        raphaels[entered_box_n].forEach(function (el) 
        {
            el.attr({"opacity": 1});
        });
    }
    event.target.style["cursor"] = "grabbing";
    //e.target.classList.add('drag-over');
}
function dragOver(e) {
    e.preventDefault();
    let entered_box_n = null;
    if ( e.target.nodeName == 'DIV' ){
        entered_box_n = Number(e.target.id.split(" ")[1]);
    } else if ( e.target.nodeName == 'svg' ){
        entered_box_n = Number(e.target.parentElement.id.split(" ")[1]);
    } else {
        entered_box_n = Number(e.target.parentElement.parentElement.id.split(" ")[1]);
    }
    //console.log("over: box ", entered_box_n);

    if ( entered_box_n != null ){
        raphaels[entered_box_n].forEach(function (el) 
        {
            el.attr({"opacity": 1});
        });
    }
    event.target.style["cursor"] = "pointer";
    //e.target.classList.add('drag-over');

}
function dragLeave(e) {
    //e.target.classList.remove('drag-over');
    e.preventDefault();
    let left_box_n = null;
    if ( e.target.nodeName == 'DIV' ){
        left_box_n = Number(e.target.id.split(" ")[1]);
    } else if ( e.target.nodeName == 'svg' ){
        left_box_n = Number(e.target.parentElement.id.split(" ")[1]);
    } else {
        left_box_n = Number(e.target.parentElement.parentElement.id.split(" ")[1]);
    }

    //console.log("left: box ", left_box_n);

    if ( left_box_n != null ){
        raphaels[left_box_n].forEach(function (el) 
        {
            el.attr({"opacity": 0.3});
        });   
    }
    event.target.style["cursor"] = "default";

}

 function drop(e) {

    // get the id of the event target
    let index_target = null;
    if ( e.target.nodeName == 'DIV' ){
        index_target = Number(e.target.id.split(" ")[1]);
    } else if ( e.target.nodeName == 'svg' ){
        index_target = Number(e.target.parentElement.id.split(" ")[1]);
    } else {
        index_target = Number(e.target.parentElement.parentElement.id.split(" ")[1]);
    }
    if ( index_target != null ){
        raphaels[index_target].forEach(function (el) 
        {
            el.attr({"opacity": 0.3});
        });   
    }
    event.target.style["cursor"] = "default";

    // get the draggable element
    let id = e.dataTransfer.getData('text/plain');
    let draggable = document.getElementById(id);

    // get box indices
    let index_draggable = Number(id.split(' ')[1]);
    //let index_target = Number(e.target.id.split(' ')[1]);
    var draggable_x = null;
    var draggable_y = null;
    var target_x = null;
    var target_y = null;

    if (index_draggable != index_target){
        
        // locate boxes to prepend
        let draggable_node = document.getElementById("box "+index_draggable);
        let target_node = document.getElementById("box "+index_target);
        console.log('prepending box '+ index_draggable + ' on top of box '+ index_target);
        let parent = document.getElementById("composition-bar");
        
        // prepend boxes
        prependElement(draggable_node, target_node);
        var compositionElementDraggable = compositionArray[index_draggable];
        var raphaelDraggable = raphaels[index_draggable];
        if (index_draggable > index_target) { 
            compositionArray.splice(index_draggable, 1);
            compositionArray.splice(index_target, 0, compositionElementDraggable);
    
            raphaels.splice(index_draggable, 1);
            raphaels.splice(index_target, 0, raphaelDraggable);    
        } else {
            compositionArray.splice(index_target, 0, compositionElementDraggable);
            compositionArray.splice(index_draggable, 1);
    
            raphaels.splice(index_target, 0, raphaelDraggable);    
            raphaels.splice(index_draggable, 1);

        }

        // correct ids
        for ( let i = 0; i < parent.children.length; i++ ) {
            let node = parent.children[i];
            node.id = 'box ' + (i);    
        }

        /*
        let new_draggable_node = document.getElementById('box '+ (index_draggable)); 
        new_draggable_node.id = 'box ' + (index_target);
        for ( let i = index_target+1; i < parent.children.length; i++ ) {
            let node = parent.children[i];
            node.id = 'box ' + (i);    
            console.log(i);
        }*/

        //[compositionArray[index_draggable], compositionArray[index_target]] = [compositionArray[index_target], compositionArray[index_draggable]];
        //[raphaels[index_draggable], raphaels[index_target]] = [raphaels[index_target], raphaels[index_draggable]];

        // correct ids
        //let new_target_node = document.getElementById('box '+ (index_target));
        //let new_draggable_node = document.getElementById('box '+ (index_draggable)); 
        //new_target_node.id = 'box ' + (index_draggable);
        //new_draggable_node.id = 'box ' + (index_target);

    }
    renderPath();
    // update scatterplot representation
}

function prependElement( element1, element2 ){

    var clonedElement1 = element1.cloneNode(true);
    var clonedElement2 = element2.cloneNode(true);
    element2.parentNode.replaceChild(clonedElement1, element1);
    element2.parentNode.replaceChild(clonedElement2, element2);
    clonedElement2.parentNode.insertBefore( element1, clonedElement2 );
    clonedElement2.parentNode.replaceChild( element2, clonedElement2 );
    clonedElement1.remove();

}

// exchange boxes
function exchangeElements(element1, element2){

    clonedElement2.parentNode.replaceChild( element1, clonedElement1 );
    clonedElement2.parentNode.replaceChild( element2, clonedElement2 );
    element2.parentNode.replaceChild(clonedElement1, element2);
    element1.parentNode.replaceChild(clonedElement2, element1);
    clonedElement1.parentNode.replaceChild(element1, clonedElement1);
    clonedElement2.parentNode.replaceChild(element2, clonedElement2);
}



// BOX EXCHANGE     DONE
// WINDOW SIZE UPDATE       DONE
// CLICK ON POINT CLOUD --> CREATE BOX      DONE
// BUTTONS: CREATE CROSSFADE, CREATE MEANDER, CLICK ON BIN      DONE
// OSC COMMUNICATION
// HOVER FOR A LONG TIME INCREASES VOLUME AND BIGGER POINTER
// BUTTONS: PLAY AND STOP       DONE
// LOGIC WITH LONG AND SHORT TERM PLAY FUNCTIONS        DONE
// RENDER 
// FIX POSITION OF TIMELINE, SCATTERPLOT AND COMMANDS WHEN COMPOSTION BAR GOES DOWN (scroll bar only inside composition bar)
// SAVE SOUND FILE RECODING AND COMPOSITION ARRAY (JSON) WITH WEBPD 
// LIVE SOUND SCOPE WOULD BE AWESOME

/* FOR WEBPAGE: 
- SWITCHABLE EXAMPLES OF SMALL COMPOSITIONS
- PANE TO CHECK BENJOLIN PARAMETERS (AND MANIPULATE?)
- CREDITS AND LINKS
- CONSOLE FOR MESSAGES?
*/





// import { data } from 'jquery';

// VISUALIZATION PROPERTIES
const scale_x = 100;
const scale_y = 200;
const scale_z = 300;
const CAMERA_POSITION = 1500;

const BASE_OPACITY = 0.7;



const N_POINTS = x.length;
let particles;

let renderer, scene, camera, material, controls, stats;
let raycaster, intersects;
let pointer, INTERSECTED;

const PARTICLE_SIZE = 15;
const BIGPARTICLE_SIZE = PARTICLE_SIZE * BASIC_ELEMENT_T * TIME_TO_POINTSIZE;

init();

function init() {

    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xcccccc, 1, 100 );

    // CAMERA
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight , 1, 10000 );
    camera.position.z = CAMERA_POSITION;

    // RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
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
    //controls.maxPolarAngle = Math.PI / 2;

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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth-10 , window.innerHeight-10 );
}
// ANIMATE FOR CAMERA NAVIGATION
function animate() {
    //controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    render();
}
// RENDER FUNCTION FOR ANIMATION
function render() {
    const time = Date.now() * 0.5;

    if ( SELECTED_ELEMENT == null ){
	    pickHelper.pick(pickPosition, scene, camera, time);
	    if ( canClick ){ // check for click and not drag
	        pickHelper.click(pickPosition, scene, camera, time);
	        canClick = false;
	    }
    }
    // PICKED INDEX DISAPPEARS WHEN OUT OF SCATTERPLOT
    if ( !MOUSEONSCATTERPLOT ){
        pointToBasic(CURRENTPICKEDINDEX);
        CURRENTPICKEDINDEX = null;
    }

    // CURSOR ANIMATION 
    //updateCursor();
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
        if ( !clickedIndices.includes(CURRENTPICKEDINDEX) ) {
            pointToBasic(CURRENTPICKEDINDEX);
            this.pickedObject = undefined;
            this.pickedObjectIndex = undefined;
        }
        /*if (this.pickedObject) {
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
        }*/
        // cast a ray through the frustum
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(scene.children);

        if (intersectedObjects.length) {
            // pick the first object. It's the closest one
            this.pickedObject = intersectedObjects[0].object;
            this.pickedObjectIndex = intersectedObjects[0].index;
            if ( !clickedIndices.includes(this.pickedObjectIndex) && this.pickedObjectIndex != 0 ){
                particles.geometry.attributes.size.array[ this.pickedObjectIndex ] = BIGPARTICLE_SIZE;
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
                //material.needsUpdate = true
            }
            //console.log("picked ID: "+intersectedObjects[0].index);
            let params = sendBox(x[this.pickedObjectIndex], y[this.pickedObjectIndex], z[this.pickedObjectIndex]);
            setBenjolin(params);
        } else {
            // sendStop();
            changeGain(0);
        }
        CURRENTPICKEDINDEX = this.pickedObjectIndex;
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
            if ( intersectedObjects[0].index != this.clickedObjectIndex ){
                let compositionTime = calculateCurrentCompostionTime();
                if ( compositionTime < MAX_COMPOSITION_DURATION){
                    
                    // click the first object. It's the closest one            
                    this.clickedObject = intersectedObjects[0].object;
                    this.clickedObjectIndex = intersectedObjects[0].index;
                    clickedIndices.push(this.clickedObjectIndex);
                    // update size
                    particles.geometry.attributes.size.array[ this.clickedObjectIndex ] = BIGPARTICLE_SIZE;
                    particles.geometry.attributes.size.needsUpdate = true;
                    // update opacity
                    particles.geometry.attributes.opacity.array[ this.clickedObjectIndex ] = 1;
                    particles.geometry.attributes.opacity.needsUpdate = true;
                    // update color
                    let newcolor = new THREE.Color();
                    let newHueValue = Math.random();
                    let newRGBvalues = colorHsbToRgb( newHueValue*360, 0.9*100, 0.9*100 );
                    newcolor.setRGB( newRGBvalues[0]/255, newRGBvalues[1]/255, newRGBvalues[2]/255 );
                    particles.geometry.attributes.customColor.array[ this.clickedObjectIndex * 3 ] = newcolor.r;
                    particles.geometry.attributes.customColor.array[ this.clickedObjectIndex * 3 + 1 ] = newcolor.g;
                    particles.geometry.attributes.customColor.array[ this.clickedObjectIndex * 3 + 2 ] = newcolor.b;
                    particles.geometry.attributes.customColor.needsUpdate = true;
                    material.needsUpdate = true;
                    console.log("clicked ID: "+intersectedObjects[0].index);

                    drawBox(x[ this.clickedObjectIndex ], y[ this.clickedObjectIndex ], z[ this.clickedObjectIndex ], 
                        newHueValue, this.clickedObjectIndex); 
                }
            }
        }
    }
}

function changePointSize ( box_n, size ){
    let newBoxTime = pxHeightToTimesMs(size)
    particles.geometry.attributes.size.array[ compositionArray[box_n].arrayIndex ] = PARTICLE_SIZE * newBoxTime * TIME_TO_POINTSIZE;
    particles.geometry.attributes.size.needsUpdate = true;
}



const colorHsbToRgb = (h, s, b) => {
    s /= 100;
    b /= 100;
    const k = (n) => (n + h / 60) % 6;
    const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    return [255 * f(5), 255 * f(3), 255 * f(1)];
};


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


let MOUSEONSCATTERPLOT = false;
document.getElementById("scatterPlot").addEventListener("mouseenter", function(  ) {
    MOUSEONSCATTERPLOT=true;
});
document.getElementById("scatterPlot").addEventListener("mouseout", function(  ) { 
    MOUSEONSCATTERPLOT=false;
});

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


let linecolor = new THREE.Color();
linecolor.r = linecolor.g = linecolor.b = 0.9;


let arrowsIDs = []
// RENDER PATH
function renderPath(){
    // remove all previous lines
    for (let i = 0; i < arrowsIDs.length; i++) {
        //console.log(arrowsIDs[i])
        var selectedObject = scene.getObjectByName(arrowsIDs[i]);
        scene.remove( selectedObject );
    }
    MEANDERS_LIST = [];
    numMeanders = 0;
    // draw new arrows
    for (let i = 0; i < compositionArray.length; i++) {
        if (i !=0){ // check if not on the first object
            if (compositionArray[i] instanceof Crossfade){
                // check if before and after there are boxes
                if (compositionArray[i-1] instanceof Box && compositionArray[i+1] instanceof Box){

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
                    let linematerial = new THREE.LineBasicMaterial( { color: linecolor, linewidth: 10, opacity: 0.9} );
                    let line = new THREE.Line( linegeometry, linematerial );
                    //let line = customArrow(x1,y1,z1,x2,y2,z2, 10, 0x0000ff);
                    let line_name = "crossfade "+compositionArray[i-1].arrayIndex+' '+compositionArray[i+1].arrayIndex;
                    line.name = line_name;
                    arrowsIDs.push(line_name);
                    scene.add( line );

                }
            } 
            else if (compositionArray[i] instanceof Meander){
                // check if before and after there are boxes
                if (compositionArray[i-1] instanceof Box && compositionArray[i+1] instanceof Box){

                    let linepoints = [];
                    let x1 = compositionArray[i-1].x, //* scale_x - (scale_x/2),
                        y1 = compositionArray[i-1].y, //* scale_y - (scale_y/2),
                        z1 = compositionArray[i-1].z; //* scale_z - (scale_z/2);
                    let x2 = compositionArray[i+1].x, //* scale_x - (scale_x/2),
                        y2 = compositionArray[i+1].y, //* scale_y - (scale_y/2),
                        z2 = compositionArray[i+1].z; // * scale_z - (scale_z/2);

                    let path_coordinates = sendDrawMeander(x1, y1, z1, x2, y2, z2);
                    storeMeander(path_coordinates);
                    
                }
            } 
            else if (compositionArray[i] instanceof Box){
                // check if before there is a box
                if (compositionArray[i-1] instanceof Box){ 
                    // add straight line if jump
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
                    let linematerial = new THREE.LineDashedMaterial( {  color: linecolor, dashSize: 2, gapSize: 2, opacity: 0.9 } );
                    let line = new THREE.Line( linegeometry, linematerial );
                    line.computeLineDistances();
                    let line_name = "jump "+compositionArray[i-1].arrayIndex+' '+compositionArray[i].arrayIndex;
                    line.name = line_name;
                    arrowsIDs.push(line_name);
                    scene.add( line );

                }
            }
        }
    }
}

let MEANDERS_LIST = [];
let numMeanders = 0;
let newMeanderIndices = undefined;

function storeMeander(pathCoords) {
    // console.log(pathCoords);
    if ( pathCoords ){
        for ( let i = 0; i < pathCoords.length-1; i++) {
            
            //let preavious_meanderidx = Number(pathCoords[i-1]);
            //let meanderidx = Number(pathCoords[i]);
            let linepoints = [];
            let x1 = Number(pathCoords[i][0]) * scale_x - (scale_x/2),
                y1 = Number(pathCoords[i][1]) * scale_y - (scale_y/2),
                z1 = Number(pathCoords[i][2]) * scale_z - (scale_z/2);
            let x2 = Number(pathCoords[i+1][0]) * scale_x - (scale_x/2),
                y2 = Number(pathCoords[i+1][1]) * scale_y - (scale_y/2),
                z2 = Number(pathCoords[i+1][2]) * scale_z - (scale_z/2);
            linepoints.push( new THREE.Vector3( x1,y1,z1 )); 
            linepoints.push( new THREE.Vector3( x2,y2,z2 )); 

            let linegeometry = new THREE.BufferGeometry().setFromPoints( linepoints );
            let linematerial = new THREE.LineDashedMaterial( {  color: linecolor, dashSize: 2, gapSize: 2, opacity: 0.9 } );
            let line = new THREE.Line( linegeometry, linematerial );
            line.computeLineDistances();
            let line_name = "meandercomponent "+x1+y1+z1+" "+x2+y2+z2;
            line.name = line_name;
            arrowsIDs.push(line_name);
            scene.add( line );
        
        }
        MEANDERS_LIST.push(pathCoords);
        let internalMeanderCount = 0;
        //console.log(compositionArray)
        for ( let i = 0; i < compositionArray.length; i++ ) {
            if ( compositionArray[i] instanceof Meander ){
                if (internalMeanderCount == numMeanders ){
                    compositionArray[i].meanderComponents = MEANDERS_LIST[internalMeanderCount];
                }
                internalMeanderCount += 1;
            }
        }
        numMeanders += 1;
    }
};



function createCursor( cursor_x, cursor_y, cursor_z ){

    let newcolor = new THREE.Color();
    let newHueValue = 0.7;
    let newRGBvalues = colorHsbToRgb( newHueValue*360, 0.9*100, 0.9*100 );
    newcolor.setRGB( newRGBvalues[0]/255, newRGBvalues[1]/255, newRGBvalues[2]/255 );

    const sprite = new THREE.TextureLoader().load( 'imgs/disc.png' );
    sprite.colorSpace = THREE.SRGBColorSpace;

    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([cursor_x, cursor_y, cursor_z]), 3));
    //const dotMaterial = new THREE.PointsMaterial({ size: 10, color: newcolor });
    const dotMaterial = new THREE.PointsMaterial( { size: 10, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: false } );
    dotMaterial.color.setHSL( 0.5, 0.9, 0.8, THREE.SRGBColorSpace );
    const dot = new THREE.Points(dotGeometry, dotMaterial);
    return dot

}

function setCursorPosition( cursor_x, cursor_y, cursor_z ){
    cursor.position.x = cursor_x;
    cursor.position.y = cursor_y;
    cursor.position.z = cursor_z;
}

let meanderPlaybackTimeouts = []
function animateMeander( meander, time ){
    if ( meander ){
        console.log('MEANDER', meander[0][0],meander[1][0],meander[2][0] )
        // the interval at which the meander changes position
        let meandercursortime = 0
        let time_interval = time / meander.length;
        let cursor_x = Number(meander[0][0]), //* scale_x - (scale_x/2),
            cursor_y = Number(meander[0][1]), //* scale_y - (scale_y/2),
            cursor_z = Number(meander[0][2]); //* scale_z - (scale_z/2);
        cursor = createCursor(cursor_x, cursor_y, cursor_z);
        scene.add(cursor);
        console.log('MEANDER', cursor_x,cursor_y,cursor_z )

        for ( let i = 0; i < meander.length; i+=1 ) {
            var meanderCursorTimeout = setTimeout(function() {
                cursor_x = Number(meander[i][0]) * scale_x - (scale_x/2);
                cursor_y = Number(meander[i][1]) * scale_y - (scale_y/2);
                cursor_z = Number(meander[i][2]) * scale_z - (scale_z/2);
                setCursorPosition( cursor_x, cursor_y, cursor_z );
                console.log(cursor_x, cursor_y, cursor_z);
            }, meandercursortime );
            meandercursortime += time_interval;
            meanderPlaybackTimeouts.push(meanderCursorTimeout);
        }
        var meanderCursorTimeout = setTimeout(function() {
            scene.remove(cursor);
        }, meandercursortime );
        meanderPlaybackTimeouts.push(meanderCursorTimeout);
    }
}


let crossfadePlaybackTimeouts = []
function animateCrossfade( x1,y1,z1, x2,y2,z2, crossfade_time ){
    // the interval at which the meander changes position
    let crossfade_time_granularity = 200;
    let meandercursortime = 0
    let time_interval = crossfade_time / crossfade_time_granularity;
    let cursor_x1 = x1 * scale_x - (scale_x/2),
        cursor_y1 = y1 * scale_y - (scale_y/2),
        cursor_z1 = z1 * scale_z - (scale_z/2);
    let cursor_x2 = x2 * scale_x - (scale_x/2),
        cursor_y2 = y2 * scale_y - (scale_y/2),
        cursor_z2 = z2 * scale_z - (scale_z/2);
    let space_interval_x = (cursor_x2-cursor_x1) / crossfade_time_granularity;
    let space_interval_y = (cursor_y2-cursor_y1) / crossfade_time_granularity;
    let space_interval_z = (cursor_z2-cursor_z1) / crossfade_time_granularity;
    cursor = createCursor( cursor_x1, cursor_y1, cursor_z1 );
    scene.add(cursor);

    for ( let i = 0; i < crossfade_time_granularity; i++ ) {
        var crossfadeCursorTimeout = setTimeout(function() {

            cursor.position.x += space_interval_x;
            cursor.position.y += space_interval_y;
            cursor.position.z += space_interval_z;

        }, meandercursortime );
        meandercursortime += time_interval;
        crossfadePlaybackTimeouts.push(crossfadeCursorTimeout);
    }
    var crossfadeCursorTimeout = setTimeout(function() {
        scene.remove(cursor);
    }, meandercursortime );
    crossfadePlaybackTimeouts.push(crossfadeCursorTimeout);
}


let cursor = undefined;
let cursor_x =0, cursor_y = 0, cursor_z = 0;
let cursor_target_x = 20, cursor_target_y = 20, cursor_target_z = 20;
//cursor = createCursor( cursor_x, cursor_y, cursor_z );
//scene.add(cursor);
//animateCrossfade( 0,0,0, 20,20,20, 10000 );



//scene.remove(cursor);    

//cursor = createCursor( compositionArray[box_n].x * scale_x - (scale_x/2), 
                        //compositionArray[box_n].y * scale_y - (scale_y/2), 
                        //compositionArray[box_n].z  * scale_z - (scale_z/2));
//scene.remove(cursor);



// TEXTLOG

var open_textlog = document.getElementById("open-textlog");
var close_textlog = document.getElementById("close-textlog");
var textlog = document.getElementById("textlog");
var textlog_div = document.getElementById("text-logs");

close_textlog.style.display = "none";
textlog.style.display = "none";
open_textlog.style["cursor"] = "pointer";
close_textlog.style["cursor"] = "pointer";


open_textlog.onclick = function(){
    close_textlog.style.display = "block";
    textlog.style.display = "block";
    open_textlog.style.display = "none";
    textlog_div.style["height"] = "350px";
    textlog_div.style["width"] = "300px";
}; 

close_textlog.onclick = function(){
    close_textlog.style.display = "none";
    textlog.style.display = "none";
    open_textlog.style.display = "block";
    textlog_div.style["height"] = "20px";
    textlog_div.style["width"] = "20px";
}; 



/*
// TIMELINE CURSOR
let cursor_x = 0.1;
let cursor_y = 0.1;
let cursor_z = 0.1;

const pointergeometry = new THREE.BufferGeometry();
const pointervertices = []
let pointer_x = cursor_x * scale_x - (scale_x/2);
let pointer_y = cursor_y * scale_y - (scale_y/2);
let pointer_z = cursor_z * scale_z - (scale_z/2);
pointervertices.push( pointer_x, pointer_y, pointer_z);

const pointercolors = []
const pointercolor = new THREE.Color();
pointercolor.setRGB( 255, 0, 0 );
pointercolors.push( pointercolor.r, pointercolor.g, pointercolor.b );

let pointersize = PARTICLE_SIZE;
let pointeropacity = BASE_OPACITY;

pointergeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( pointervertices, 3 ) );
pointergeometry.setAttribute( 'customColor', new THREE.Float32BufferAttribute( pointercolors, 3 ) );
pointergeometry.setAttribute( 'size', new THREE.Float32BufferAttribute( pointersize, 1 ) );
pointergeometry.setAttribute( 'opacity', new THREE.Float32BufferAttribute( pointeropacity, 1 ) );

let pointermaterial = new THREE.ShaderMaterial( {
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
const timeline_cursor = new THREE.Points( pointergeometry, pointermaterial );
scene.add( timeline_cursor );
*/