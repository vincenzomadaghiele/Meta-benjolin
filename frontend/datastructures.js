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


// GRAPHICS GLOBAL PARAMETERS
const COMPOSITION_BAR_WIDTH_PX = 150;
const MARGIN_PX = 20
const SELECTED_OPACITY = 1;
const MIN_OPACITY = 0.3;
const HOVER_OPACITY = 0.6;
const COMPOSITION_BAR_HEIGHT_PX = 1000;
let raphaels = [];


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

let canClick = false;
