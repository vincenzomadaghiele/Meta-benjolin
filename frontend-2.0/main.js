// GRAPHICS GLOBAL PARAMETERS
const COMPOSITION_BAR_WIDTH_PX = 150;
const MARGIN_PX = 20
const SELECTED_OPACITY = 1;
const MIN_OPACITY = 0.3;
const HOVER_OPACITY = 0.6;
const COMPOSITION_BAR_HEIGHT_PX = 1000;
let raphaels = [];


// DRAW TIMELINE
var R_timeline = Raphael("timeline", 50, window.innerHeight - (90 + 60 + 20) );
path_timeline = R_timeline.path("M25 0L25 "+(window.innerHeight - (90 + 60 +50))).attr({
    stroke: '#FFFFFF',
    'stroke-width': 1,
    'arrow-end':'classic-wide-long',
    opacity: 0.5
});
var timeline_pathArray = path_timeline.attr("path");

window.addEventListener( 'resize', graphicsOnResize );

// UPDATE WINDOW SIZE
function graphicsOnResize() {
    // update timeline
    R_timeline.setSize(50, window.innerHeight - (90 + 60 + 20));
    //path_timeline.attr({});
    timeline_pathArray[1][2] = window.innerHeight - (90 + 60 +50);
    path_timeline.attr({path: timeline_pathArray});

    // update box sizes ?
}


// INTERACTION FLAGS
var SELECTED_ELEMENT = null;
var ISPLAYBACKON = false;
let QUEUED_TIMEOUTS = []; // all timeouts queued for playback

// COMPOSITION TIMINGS
// window.innerHeight = 514 = 2 min = 120 s
// a radius of 55 means a diameter of 110 --> 110 / 514 = 0.214. multiplied by 120 --> 25.16 s
const BASIC_ELEMENT_T = 5000 // new element when created has duration 5s
const MAX_T = 10000 // max element duration is 20s
const MIN_T = 1000 // min element duration is 1s
const MAX_COMPOSITION_DURATION = 120000 // 12000 milliseconds = 2 minutes

function timesToPxHeight (time_ms) {
    // adaptively calculate element height in pixel corresponding to time in milliseconds
    // window height : max duration = height_px : time_ms
    // dependent on window height
    //let conversion_factor = window.innerHeight / MAX_COMPOSITION_DURATION;
    
    // dependent on set size
    let conversion_factor = COMPOSITION_BAR_HEIGHT_PX / MAX_COMPOSITION_DURATION;
    let height_px = time_ms * conversion_factor;
    return height_px
}
function pxHeightToTimesMs (height_px) {
    // adaptively calculate element height in pixel corresponding to time in milliseconds
    // window height : max duration = height_px : time_ms
    // dependent on window height
    //let time_ms = height_px * MAX_COMPOSITION_DURATION / window.innerHeight;
    // dependent on set size
    let time_ms = height_px * MAX_COMPOSITION_DURATION / COMPOSITION_BAR_HEIGHT_PX;
    return time_ms
}

// COMPOSITION FUNCTIONALITIES
/*class Box{
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

const compositionArray = [];*/

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
            }
        }); 
        // CLICK INTERACTION
        newBox.addEventListener("click", (event) => {
            if ( !ISPLAYBACKON ){
                for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
                    clearTimeout(singlePlaybackTimeouts[i]);
                }            
                let item_index = Number(newBox.id.split(" ")[1])
                SELECTED_ELEMENT = item_index;
                highlightBox( item_index ); 
                playBox( item_index );
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
    }
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
            //changePointSize(item_index, newr*2);
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
    }
}

// CROSSFADE
function drawCrossfade(){
    let compositionTime = calculateCurrentCompostionTime();
    if ( compositionTime < MAX_COMPOSITION_DURATION){

        let newBox = document.createElement("div");
        newBox.id = "box "+numBoxes;
        newBox.className = 'crossfade';
        document.getElementById("composition-bar").appendChild(newBox); 

        let boxStartHeight = timesToPxHeight( BASIC_ELEMENT_T );
        // from https://jsfiddle.net/TfE2X/
        var R = Raphael("box "+numBoxes, COMPOSITION_BAR_WIDTH_PX, boxStartHeight+MARGIN_PX);
        path = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2)+" 0L"+(COMPOSITION_BAR_WIDTH_PX/2)+" "+boxStartHeight).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            'arrow-end':'classic-wide-long',
            opacity: 0.3
        });
        var pathArray = path.attr("path");
        handle = R.circle(COMPOSITION_BAR_WIDTH_PX/2,boxStartHeight-5,10).attr({
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
            }
        }); 
        // CLICK INTERACTION
        newBox.addEventListener("click", (event) => {
            if ( !ISPLAYBACKON ){
                for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
                    clearTimeout(singlePlaybackTimeouts[i]);
                }            
                let item_index = Number(newBox.id.split(" ")[1])
                SELECTED_ELEMENT = item_index;
                highlightBox(item_index); 
                playBox( SELECTED_ELEMENT );
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
    }
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
    }
};


function drawMeander(){
    let compositionTime = calculateCurrentCompostionTime();
    if ( compositionTime < MAX_COMPOSITION_DURATION){

        let newBox = document.createElement("div");
        newBox.id = "box "+numBoxes;
        newBox.className = 'meander';
        document.getElementById("composition-bar").appendChild(newBox); 

        let boxStartHeight = timesToPxHeight( BASIC_ELEMENT_T );
        var R = Raphael("box "+numBoxes, COMPOSITION_BAR_WIDTH_PX, boxStartHeight+MARGIN_PX);
        path1 = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2)+" 0L"+(COMPOSITION_BAR_WIDTH_PX/2+15)+" "+ (boxStartHeight/4)).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            opacity: 0.3
        });
        path2 = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2+15)+" "+(boxStartHeight/4)+"L"+(COMPOSITION_BAR_WIDTH_PX/2-15)+" "+(boxStartHeight*2/4)).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            opacity: 0.3
        });
        path3 = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2-15)+" "+(boxStartHeight*2/4)+"L"+(COMPOSITION_BAR_WIDTH_PX/2)+" "+(boxStartHeight*3/4)).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            opacity: 0.3
        });
        path4 = R.path("M"+(COMPOSITION_BAR_WIDTH_PX/2)+" "+(boxStartHeight*3/4)+"L"+(COMPOSITION_BAR_WIDTH_PX/2)+" "+boxStartHeight).attr({
            stroke: '#FFFFFF',
            'stroke-width': 3,
            'arrow-end':'classic-wide-long',
            opacity: 0.3
        });

        var pathArray1 = path1.attr("path");
        var pathArray2 = path2.attr("path");
        var pathArray3 = path3.attr("path");
        var pathArray4 = path4.attr("path");
        handle_meander = R.circle(COMPOSITION_BAR_WIDTH_PX/2,boxStartHeight-5,10).attr({
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
            }
        }); 
        // CLICK INTERACTION
        newBox.addEventListener("click", (event) => {
            if ( !ISPLAYBACKON ){
                for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
                    clearTimeout(singlePlaybackTimeouts[i]);
                }            
                let item_index = Number(newBox.id.split(" ")[1])
                SELECTED_ELEMENT = item_index;
                highlightBox(item_index); 
                playBox( SELECTED_ELEMENT );
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
    }
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
    }
}

function highlightBox (box_n){
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
    if ( SELECTED_ELEMENT != null ){
        raphaels[SELECTED_ELEMENT].forEach(function (el) 
        {
            el.attr({"opacity": SELECTED_OPACITY});
        });
    }
}

const singlePlaybackTimeouts = [];
function loopCrossfade( box_n ){
    sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y);
    sendCrossfade(compositionArray[box_n-1].x, compositionArray[box_n-1].y, 
        compositionArray[box_n+1].x, compositionArray[box_n+1].y, 
        compositionArray[box_n].duration / 1000);
    var selectedBoxTimeout = setTimeout(function() {
        if ( SELECTED_ELEMENT != null ){
            loopCrossfade( box_n );
        } 
    }, compositionArray[box_n].duration );
    singlePlaybackTimeouts.push(selectedBoxTimeout);
}

function loopMeander( box_n ){
    sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y);
    sendMeander(compositionArray[box_n-1].x, compositionArray[box_n-1].y, 
        compositionArray[box_n+1].x, compositionArray[box_n+1].y, 
        compositionArray[box_n].duration / 1000);
    var selectedBoxTimeout = setTimeout(function() {
        if ( SELECTED_ELEMENT != null ){
            loopMeander( box_n );
        } 
    }, compositionArray[box_n].duration );
    singlePlaybackTimeouts.push(selectedBoxTimeout);
}

function playBox( box_n ){
    if ( compositionArray[box_n] instanceof Box ){
        sendBox( compositionArray[box_n].x, compositionArray[box_n].y )
    } else if ( box_n != 0 && compositionArray[box_n] instanceof Crossfade ) {
        // check if before and after there are boxes
        if (compositionArray[box_n-1] instanceof Box && compositionArray[box_n+1] instanceof Box){
            if ( !ISPLAYBACKON ){
                // loop the crossfade
                loopCrossfade( box_n );
                /*sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y);
                sendCrossfade(compositionArray[box_n-1].x, compositionArray[box_n-1].y, 
                    compositionArray[box_n+1].x, compositionArray[box_n+1].y, 
                    compositionArray[box_n].duration / 1000);
                var selectedBoxTimeout = setTimeout(function() {
                    if ( SELECTED_ELEMENT != null ){
                        sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y);
                        sendCrossfade(compositionArray[box_n-1].x, compositionArray[box_n-1].y, 
                            compositionArray[box_n+1].x, compositionArray[box_n+1].y, 
                            compositionArray[box_n].duration / 1000);
                        }
                    }, compositionArray[box_n].duration );*/

            } else {
                // play crossfade only once
                sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y);
                sendCrossfade(compositionArray[box_n-1].x, compositionArray[box_n-1].y, 
                    compositionArray[box_n+1].x, compositionArray[box_n+1].y, 
                    compositionArray[box_n].duration / 1000);    
            }    
        }

    } else if ( box_n != 0 && compositionArray[box_n] instanceof Meander ) {
        // check if before and after there are boxes
        if (compositionArray[box_n-1] instanceof Box && compositionArray[box_n+1] instanceof Box){
            if ( !ISPLAYBACKON ){
                // loop the meander
                loopMeander( box_n );

            } else {
                // play meander only once
                sendBox(compositionArray[box_n-1].x, compositionArray[box_n-1].y);
                sendMeander(compositionArray[box_n-1].x, compositionArray[box_n-1].y, 
                    compositionArray[box_n+1].x, compositionArray[box_n+1].y, 
                    compositionArray[box_n].duration / 1000);    
            }    
        }

    }
    
}

function highlightAll (){    
    for (var i = 0; i < raphaels.length; i++) {
        raphaels[i].forEach(function (el) 
        {
            el.attr({"opacity": HOVER_OPACITY});
        });
    }
}




// INTERACTIONS AT BUTTONS
document.getElementById("insert-crossfade").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        event.target.style["cursor"] = "pointer";        
    }
}); 
document.getElementById("insert-crossfade").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        SELECTED_ELEMENT = null;
        highlightNone(); 
        drawCrossfade();
    }
}); 

// INSERT MEANDER BUTTON
document.getElementById("insert-meander").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){    
        highlightNone(); 
        event.target.style["cursor"] = "pointer";
    }
}); 
document.getElementById("insert-meander").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        SELECTED_ELEMENT = null;
        highlightNone(); 
        drawMeander();
    }
}); 

// TRASH BIN BUTTON
document.getElementById("bin").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        event.target.style["cursor"] = "pointer";
    }
}); 
document.getElementById("bin").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        if ( SELECTED_ELEMENT != null ){
            // trash the element
            removeElement(SELECTED_ELEMENT)
        }
        SELECTED_ELEMENT = null;
        highlightNone(); 
    }
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
    // remove item from composition array
    //let comp_index = Number(id_draggable.split(' ')[1]);
    compositionArray.splice(element_index, 1);
    // remove raphael item from canvas array
    raphaels.splice(element_index, 1);
    console.log("composition: ", compositionArray);
}

// PLAY BUTTON
document.getElementById("play").addEventListener("mouseover", (event) => {
    if ( !ISPLAYBACKON ){
        highlightAll(); 
        event.target.style["cursor"] = "pointer";
    }
}); 
document.getElementById("play").addEventListener("click", (event) => {
    if ( !ISPLAYBACKON ){
        highlightNone(); 
        SELECTED_ELEMENT = null;
        play();
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
                highlightBox(i);
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
            SELECTED_ELEMENT = null;
            ISPLAYBACKON = false;
            //sendStop();
            enableAllInteractions();
            highlightNone();
        }
    }, timeout+100);
    QUEUED_TIMEOUTS.push(newtimeout);
};

function disableAllInteractions(){
    document.getElementById("insert-crossfade").disabled = true;
    document.getElementById("insert-meander").disabled = true;
    document.getElementById("bin").disabled = true;
    document.getElementById("play").disabled = true;
    for (var i = 0; i < numBoxes; i++) {
        let thisbox = document.getElementById("box "+i);
        thisbox.draggable = false;
    }
    for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
        clearTimeout(singlePlaybackTimeouts[i]);
    }
}

// STOP BUTTON
document.getElementById("stop").addEventListener("mouseover", (event) => {
    highlightNone(); 
    event.target.style["cursor"] = "pointer";
}); 
document.getElementById("stop").addEventListener("click", (event) => {
    highlightNone(); 
    SELECTED_ELEMENT = null;
    stopPlayback();
}); 

var stopPlayback = function(){
    console.log("stopped composition playback");
    for (var i = 0; i < QUEUED_TIMEOUTS.length; i++) {
        clearTimeout(QUEUED_TIMEOUTS[i]);
    }
    for (var i = 0; i < singlePlaybackTimeouts.length; i++) {
        clearTimeout(singlePlaybackTimeouts[i]);
    }
    //sendStop();
    ISPLAYBACKON = false;
    highlightNone();
    //var all_click_on_box = document.getElementsByClassName('click-on-box');
    //for (var i = 0; i < all_click_on_box.length; i++) {
    //    all_click_on_box[i].classList.remove('click-on-box');
    //}
    enableAllInteractions();
    sendStop();
}
function enableAllInteractions(){
    document.getElementById("insert-crossfade").disabled = false;
    document.getElementById("insert-meander").disabled = false;
    document.getElementById("bin").disabled = false;
    document.getElementById("play").disabled = false;
    for (var i = 0; i < numBoxes; i++) {
        let thisbox = document.getElementById("box "+i);
        thisbox.draggable = true;
    }
}




// SCATTERPLOT HOVER
document.getElementById("scatterPlot").addEventListener("mouseover", (event) => {
    highlightNone(); 
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
    } else {
        if ( !ISPLAYBACKON ){
            // click
            if ( SELECTED_ELEMENT != null ){
                // disable listening to previous point
                SELECTED_ELEMENT = null;
                highlightNone(); 
                sendStop();
            } else {
                // you can select a new point when there is no selected point already
                canClick = true;
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
    event.target.style["cursor"] = "pointer";

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
    event.target.style["cursor"] = "pointer";

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


