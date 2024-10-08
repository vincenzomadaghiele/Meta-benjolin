// SUMMARY
// 1. WEB PAGE INITIALIZATION
// 2. SENDING MESSAGES FROM JAVASCRIPT TO THE PATCH
// 3. SENDING MESSAGES FROM THE PATCH TO JAVASCRIPT (coming soon ...)


// ------------- 1. WEB PAGE INITIALIZATION
const loadingDiv = document.querySelector('#loading')
const startButton = document.querySelector('#start')
const audioContext = new AudioContext()

let patch = null
let stream = null
let webpdNode = null

const initApp = async () => {
    // Register the worklet
    await WebPdRuntime.initialize(audioContext)

    // Fetch the patch code
    response = await fetch('patch.js')
    patch = await response.text()

    // Comment this if you don't need audio input
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Hide loading and show start button
    loadingDiv.style.display = 'none'
    startButton.style.display = 'block'
}

const startApp = async () => {
    // AudioContext needs to be resumed on click to protects users 
    // from being spammed with autoplay.
    // See : https://github.com/WebAudio/web-audio-api/issues/345
    if (audioContext.state === 'suspended') {
        audioContext.resume()
    }

    // Setup web audio graph
    webpdNode = await WebPdRuntime.run(
        audioContext, 
        patch, 
        WebPdRuntime.defaultSettingsForRun('./patch.js'),
    )
    webpdNode.connect(audioContext.destination)

    // Comment this if you don't need audio input
    const sourceNode = audioContext.createMediaStreamSource(stream)
    sourceNode.connect(webpdNode)

    // Hide the start button
    startButton.style.display = 'none'

    let startVolume = 0.2
    vol_slider.value = startVolume*127;
    sendMsgToWebPd('n_0_14', '0', [startVolume]); // volume
    randomSettings();

}

startButton.onclick = startApp

initApp().
    then(() => {
        console.log('App initialized')
    })


function randomSettings(){

    var fRQ01_slider_value = Math.random()*127;
    var rUN01_slider_value = Math.random()*127;
    var fRQ02_slider_value = Math.random()*127;
    var rUN02_slider_value = Math.random()*127;

    var fILFRQ_slider_value = Math.random()*127;
    var fILRES_slider_value = Math.random()*127;
    var fILRUN_slider_value = Math.random()*127;
    var fILSWP_slider_value = Math.random()*127;

    fRQ01_slider.value = fRQ01_slider_value;
    rUN01_slider.value = rUN01_slider_value;
    fRQ02_slider.value = fRQ02_slider_value;
    rUN02_slider.value = rUN02_slider_value;

    fILFRQ_slider.value = fILFRQ_slider_value;
    fILRES_slider.value = fILRES_slider_value;
    fILRUN_slider.value = fILRUN_slider_value;
    fILSWP_slider.value = fILSWP_slider_value;

    sendMsgToWebPd('n_0_15', '0', [fRQ01_slider_value]); 
    sendMsgToWebPd('n_0_16', '0', [rUN01_slider_value]); 
    sendMsgToWebPd('n_0_17', '0', [fRQ02_slider_value]); 
    sendMsgToWebPd('n_0_18', '0', [rUN02_slider_value]); 
    
    sendMsgToWebPd('n_0_19', '0', [fILFRQ_slider_value]); 
    sendMsgToWebPd('n_0_20', '0', [fILRES_slider_value]); 
    sendMsgToWebPd('n_0_21', '0', [fILRUN_slider_value]); 
    sendMsgToWebPd('n_0_22', '0', [fILSWP_slider_value]); 

}


var vol_slider = document.getElementById("volume-slider");

var fRQ01_slider = document.getElementById("01_FRQ-slider");
var rUN01_slider = document.getElementById("01_RUN-slider");
var fRQ02_slider = document.getElementById("02_FRQ-slider");
var rUN02_slider = document.getElementById("02_RUN-slider");

var fILFRQ_slider = document.getElementById("FIL_FRQ-slider");
var fILRES_slider = document.getElementById("FIL_RES-slider");
var fILRUN_slider = document.getElementById("FIL_RUN-slider");
var fILSWP_slider = document.getElementById("FIL_SWP-slider");

// Update the current slider value (each time you drag the slider handle)
vol_slider.oninput = function() {
    sendMsgToWebPd('n_0_14', '0', [ Number(this.value) / 127 ]); // volume
    console.log(this.value/127)
} 

fRQ01_slider.oninput = function() {
    sendMsgToWebPd('n_0_15', '0', [ Number(this.value) ]); // volume
    console.log(this.value)
} 
rUN01_slider.oninput = function() {
    sendMsgToWebPd('n_0_16', '0', [ Number(this.value) ]); // volume
    console.log(this.value)
} 
fRQ02_slider.oninput = function() {
    sendMsgToWebPd('n_0_17', '0', [ Number(this.value) ]); // volume
    console.log(this.value)
} 
rUN02_slider.oninput = function() {
    sendMsgToWebPd('n_0_18', '0', [ Number(this.value) ]); // volume
    console.log(this.value)
} 

fILFRQ_slider.oninput = function() {
    sendMsgToWebPd('n_0_19', '0', [ Number(this.value) ]); // volume
    console.log(this.value)
} 
fILRES_slider.oninput = function() {
    sendMsgToWebPd('n_0_20', '0', [ Number(this.value) ]); // volume
    console.log(this.value)
} 
fILRUN_slider.oninput = function() {
    sendMsgToWebPd('n_0_21', '0', [ Number(this.value) ]); // volume
    console.log(this.value)
} 
fILSWP_slider.oninput = function() {
    sendMsgToWebPd('n_0_22', '0', [ Number(this.value) ]); // volume
    console.log(this.value)
} 


var randomButton = document.getElementById('random');
randomButton.onclick = function() {
    sendMsgToWebPd('n_0_23', '0', [ Number(1) ]); // random
}

var recordButton = document.getElementById('record');
recordButton.onclick = function() {
    sendMsgToWebPd('n_0_41', '0', [ Number(1) ]); // record
}


// ------------- 2. SENDING MESSAGES FROM JAVASCRIPT TO THE PATCH
// Use the function sendMsgToWebPd to send a message from JavaScript to an object inside your patch.
// 
// Parameters : 
// - nodeId: the ID of the object you want to send a message to. 
//          This ID is a string that has been assigned by WebPd at compilation.
//          You can find below the list of available IDs with hints to help you 
//          identify the object you want to interact with.
// - portletId : the ID of the object portlet to which the message should be sent. 
// - message : the message to send. This must be a list of strings and / or numbers.
// 
// Examples :
// - sending a message to a bang node of ID 'n_0_1' :
//          sendMsgToWebPd('n_0_1', '0', ['bang'])
// - sending a message to a number object of ID 'n_0_2' :
//          sendMsgToWebPd('n_0_2', '0', [123])
// 
const sendMsgToWebPd = (nodeId, portletId, message) => {
    webpdNode.port.postMessage({
        type: 'io:messageReceiver',
        payload: {
            nodeId,
            portletId,
            message,
        },
    })
}

// Here is an index of objects IDs to which you can send messages, with hints so you can find the right ID.
// Note that by default only GUI objects (bangs, sliders, etc ...) are available.
//  - nodeId "n_0_14" portletId "0"
//      * type "hsl"
//      * position [328,455]
//      * label "VOL"

//  - nodeId "n_0_15" portletId "0"
//      * type "vsl"
//      * position [58,226]
//      * label "01_FRQ"

//  - nodeId "n_0_16" portletId "0"
//      * type "vsl"
//      * position [108,226]
//      * label "01_RUN"

//  - nodeId "n_0_17" portletId "0"
//      * type "vsl"
//      * position [158,226]
//      * label "02_FRQ"

//  - nodeId "n_0_18" portletId "0"
//      * type "vsl"
//      * position [208,226]
//      * label "02_RUN"

//  - nodeId "n_0_19" portletId "0"
//      * type "vsl"
//      * position [58,386]
//      * label "FIL_FRQ"

//  - nodeId "n_0_20" portletId "0"
//      * type "vsl"
//      * position [108,385]
//      * label "FIL_RES"

//  - nodeId "n_0_21" portletId "0"
//      * type "vsl"
//      * position [158,386]
//      * label "FIL_RUN"

//  - nodeId "n_0_22" portletId "0"
//      * type "vsl"
//      * position [208,386]
//      * label "FIL_SWP"

//  - nodeId "n_0_23" portletId "0"
//      * type "tgl"
//      * position [102,53]
//      * label "RANDOM"

//  - nodeId "n_0_24" portletId "0"
//      * type "bng"
//      * position [102,77]

//  - nodeId "n_0_34" portletId "0"
//      * type "msg"
//      * position [516,469]

//  - nodeId "n_0_36" portletId "0"
//      * type "msg"
//      * position [516,442]

//  - nodeId "n_0_37" portletId "0"
//      * type "msg"
//      * position [556,442]

//  - nodeId "n_0_38" portletId "0"
//      * type "bng"
//      * position [516,367]

//  - nodeId "n_0_40" portletId "0"
//      * type "bng"
//      * position [609,442]

//  - nodeId "n_0_41" portletId "0"
//      * type "tgl"
//      * position [516,339]
//      * label "RECORD"



// ------------- 3. SENDING MESSAGES FROM THE PATCH TO JAVASCRIPT
// Coming soon ... 

