const buttonOn = document.querySelector('#audioOn');
const volumeControl = document.querySelector("#volume");
const frq01_Control = document.querySelector("#FRQ01");
const frq02_Control = document.querySelector("#FRQ02");
const run01_Control = document.querySelector("#RUN01");
const run02_Control = document.querySelector("#RUN02");
const filFrq_Control = document.querySelector("#FIL_FRQ");


// create audio context
let audioContext = new AudioContext()
let out = audioContext.destination;

buttonOn.addEventListener("click", function (){
    audioContext.resume();
    console.log('starting audio context')
})

audioContext.audioWorklet.addModule("modules.js").then(() => {
    let RunglerNode = new AudioWorkletNode(audioContext,"rungler");
    let O1 = new AudioWorkletNode(audioContext,"osc-processor");
    let O2 = new AudioWorkletNode(audioContext,"osc-processor");
    let comparator = new AudioWorkletNode(audioContext,"comparator");
    O1.parameters.get('FRQ').value = 0;
    O1.parameters.get('RUN').value = 0;
    O2.parameters.get('FRQ').value = 0;
    O2.parameters.get('RUN').value = 0;
    let gainNode = audioContext.createGain(); 
    volumeControl.oninput = function (){ gainNode.gain.value = this.value; }
    frq01_Control.oninput = function (){ O1.parameters.get('FRQ').value = this.value; }
    frq02_Control.oninput = function (){ O2.parameters.get('FRQ').value = this.value; }
    run01_Control.oninput = function (){ O1.parameters.get('RUN').value = this.value; }
    run02_Control.oninput = function (){ O2.parameters.get('RUN').value = this.value; }

 
    // create audio graph
    let tri01 = audioContext.createOscillator();
    tri01.type = 'triangle';
    tri01.frequency.value = 0;
    tri01.start()
    let pulse01 = audioContext.createOscillator();
    pulse01.type = 'square';
    pulse01.frequency.value = 0;
    pulse01.start()
    let tri02 = audioContext.createOscillator();
    tri02.type = 'triangle';
    tri02.frequency.value = 0;
    tri02.start()
    let pulse02 = audioContext.createOscillator();
    pulse02.type = 'square';
    pulse02.frequency.value = 0;
    pulse02.start()

    // merge signals to pass them to the rungler circuit
    const merger = audioContext.createChannelMerger(2);
    pulse01.connect(merger, 0, 0); // substitute with pulse
    pulse02.connect(merger, 0, 1); // substitute with pulse
    merger.connect(RunglerNode);
    // split merger to separate run and xor signals
    const splitter = audioContext.createChannelSplitter(2);
    RunglerNode.connect(splitter); // out0: RUN, out1: XOR
    // connect rungler to osc frequencies
    splitter.connect(O1, 0, 0);
    const delayedO1 = audioContext.createDelay();
    delayedO1.delayTime.value = 0.0001;
    O1.connect(delayedO1);
    delayedO1.connect(tri01.frequency);
    delayedO1.connect(pulse01.frequency); // send to rungler
    splitter.connect(O2, 0, 0);
    const delayedO2 = audioContext.createDelay();
    delayedO2.delayTime.value = 0.0001;
    O2.connect(delayedO2);
    delayedO2.connect(tri02.frequency);
    delayedO2.connect(pulse02.frequency); // send to rungler
    const merger2compare = audioContext.createChannelMerger(2);
    tri01.connect(merger2compare, 0, 0); // substitute with pulse
    tri02.connect(merger2compare, 0, 1); // substitute with pulse
    const reSplitter = audioContext.createChannelSplitter(2);
    merger2compare.connect(reSplitter);
    let halfGainNode = audioContext.createGain(); 
    halfGainNode.gain.value = 0.5;
    reSplitter.connect(halfGainNode, 0, 0);
    splitter.connect(halfGainNode, 0, 0);
    halfGainNode.connect(gainNode).connect(out);

})


// merge signals to pass them to the rungler circuit
// const merger = audioContext.createChannelMerger(2);
// phasor01.connect(merger, 0, 0); // substitute with pulse
// phasor02.connect(merger, 0, 1); // substitute with pulse
// merger.connect(RunglerNode);
// // split merger to separate run and xor signals
// const splitter = audioContext.createChannelSplitter(2);
// RunglerNode.connect(splitter); // out0: RUN, out1: XOR
// // connect rungler to osc frequencies
// splitter.connect(O1, 0, 0);
// O1.connect(tri01.frequency);
// O1.connect(pulse01.frequency); // send to rungler
// splitter.connect(O2, 0, 0);
// O2.connect(tri02.frequency);
// O2.connect(pulse02.frequency); // send to rungler
// tri01.connect(gainNode).connect(out);
// tri02.connect(gainNode).connect(out);
