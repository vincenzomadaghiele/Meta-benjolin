// get buttons and sliders
const buttonOn = document.querySelector('#audioOn');
const randomButton = document.querySelector('#random');
const volumeControl = document.querySelector("#volume");
const frq01_Control = document.querySelector("#FRQ01");
const frq02_Control = document.querySelector("#FRQ02");
const run01_Control = document.querySelector("#RUN01");
const run02_Control = document.querySelector("#RUN02");
const filFrq_Control = document.querySelector("#FIL_FRQ");
const filRes_Control = document.querySelector("#FIL_RES");
const filRun_Control = document.querySelector("#FIL_RUN");
const filSwp_Control = document.querySelector("#FIL_SWP");

// create audio context
let audioContext = new AudioContext()
let out = audioContext.destination;

// activate audio context
buttonOn.addEventListener("click", function (){
    audioContext.resume();
    console.log('starting audio context')
})

// load modules and create benjolin
audioContext.audioWorklet.addModule("modules.js").then(() => {
    let RunglerNode = new AudioWorkletNode(audioContext,"rungler");
    let O1 = new AudioWorkletNode(audioContext,"osc-processor");
    let O2 = new AudioWorkletNode(audioContext,"osc-processor");
    let comparator = new AudioWorkletNode(audioContext,"comparator");
    let filterFreq = new AudioWorkletNode(audioContext,"filter-freq");
    O1.parameters.get('FRQ').value = 0;
    O1.parameters.get('RUN').value = 0;
    O2.parameters.get('FRQ').value = 0;
    O2.parameters.get('RUN').value = 0;
    filterFreq.parameters.get('FIL_FRQ').value = 0;
    filterFreq.parameters.get('FIL_RUN').value = 0;
    filterFreq.parameters.get('FIL_SWP').value = 0;
    let gainNode = audioContext.createGain(); 
    // main filter
    let biquadFilter = audioContext.createBiquadFilter();
    biquadFilter.type = "lowpass";
    biquadFilter.Q.value = 1;
    biquadFilter.frequency = 0;
    let gainCompensationNode = audioContext.createGain(); 
    volumeControl.oninput = function (){ gainNode.gain.value = this.value; }
    frq01_Control.oninput = function (){ O1.parameters.get('FRQ').value = this.value; }
    frq02_Control.oninput = function (){ O2.parameters.get('FRQ').value = this.value; }
    run01_Control.oninput = function (){ O1.parameters.get('RUN').value = this.value; }
    run02_Control.oninput = function (){ O2.parameters.get('RUN').value = this.value; }
    filFrq_Control.oninput = function (){ filterFreq.parameters.get('FIL_FRQ').value = this.value; }
    filRes_Control.oninput = function (){ 
        biquadFilter.Q.value = this.value / 128 * 33 - 3;
        gainCompensationNode.gain.value = this.value / 128 * 10 + 2;
    }
    filRun_Control.oninput = function (){ filterFreq.parameters.get('FIL_RUN').value = this.value; }
    filSwp_Control.oninput = function (){ filterFreq.parameters.get('FIL_SWP').value = this.value; }

 
    // create audio graph
    // MAIN OSCILLATORS
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
    // RUNGLER
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
    // COMPARATOR
    const merger2compare = audioContext.createChannelMerger(2);
    tri01.connect(merger2compare, 0, 0); // substitute with pulse
    tri02.connect(merger2compare, 0, 1); // substitute with pulse
    merger2compare.connect(comparator);
    const reSplitter = audioContext.createChannelSplitter(2);
    comparator.connect(reSplitter);
    let halfGainNode = audioContext.createGain(); 
    halfGainNode.gain.value = 0.5;
    reSplitter.connect(halfGainNode, 0, 0);
    splitter.connect(halfGainNode, 0, 0);
    // compute dynamic filter frequency
    const merger4frequency = audioContext.createChannelMerger(2);
    RunglerNode.connect(merger4frequency, 0, 0); // substitute with pulse
    tri02.connect(merger4frequency, 0, 1); // substitute with pulse
    merger4frequency.connect(filterFreq);
    filterFreq.connect(biquadFilter.frequency);
    // hipass
    let hiPassFilter = audioContext.createBiquadFilter();
    hiPassFilter.type = "highpass";
    hiPassFilter.Q.value = 1;
    hiPassFilter.frequency = 10;
    // compressor
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -30;
    compressor.knee.value = 20;
    compressor.ratio.value = 4;
    compressor.attack.value = 0;
    compressor.release.value = 0.2;
    // main filter and gain compensation
    halfGainNode.connect(biquadFilter).connect(gainCompensationNode);
    // load reverb with reverb.js
    reverbjs.extend(audioContext);
    var reverbUrl = "http://reverbjs.org/Library/Basement.m4a";
    var reverbNode = audioContext.createReverbFromUrl(reverbUrl, function() { reverbNode.connect(audioContext.destination);});
    // filtering, compressing, reverb, out
    gainCompensationNode.connect(hiPassFilter).connect(compressor).connect(reverbNode).connect(gainNode).connect(out);

    // scramble parameters
    randomButton.addEventListener("click", function (){
        console.log('scrambling parameters');
        frq01_Control.value = Math.random() * 127;
        O1.parameters.get('FRQ').value = frq01_Control.value;
        frq02_Control.value = Math.random() * 127; 
        O2.parameters.get('FRQ').value = frq02_Control.value;
        run01_Control.value = Math.random() * 127; 
        O1.parameters.get('RUN').value = run01_Control.value;
        run02_Control.value = Math.random() * 127; 
        O2.parameters.get('RUN').value = run02_Control.value;
        filFrq_Control.value = Math.random() * 127; 
        filterFreq.parameters.get('FIL_FRQ').value = filFrq_Control.value;
        filRes_Control.value = Math.random() * 127; 
        biquadFilter.Q.value = filRes_Control.value / 128 * 33 - 3;
        gainCompensationNode.gain.value = filRes_Control.value / 128 * 10 + 2;
        filRun_Control.value = Math.random() * 127; 
        filterFreq.parameters.get('FIL_RUN').value = filRun_Control.value ;
        filSwp_Control.value = Math.random() * 127; 
        filterFreq.parameters.get('FIL_SWP').value = filSwp_Control.value; 
    })

})
