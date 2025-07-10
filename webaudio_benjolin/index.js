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

// create oscillator 1
let tri01 = audioContext.createOscillator();
tri01.type = 'triangle'; // set oscillator type
tri01.frequency.value = 0;
let pulse01 = audioContext.createOscillator();
pulse01.type = "square"; // set oscillator type
pulse01.frequency.value = 0;

// create oscillator 2
let tri02 = audioContext.createOscillator();
tri02.type = 'triangle'; // set oscillator type
tri02.frequency.value = 0;
let pulse02 = audioContext.createOscillator();
pulse02.type = "square"; // set oscillator type
pulse02.frequency.value = 0;

// create gain node for volume
let gainNode = audioContext.createGain(); 


function startAudio(){

    tri01.start(); // start the oscillator
    tri02.start(); // start the oscillator
    pulse01.start(); // start the oscillator
    pulse02.start(); // start the oscillator
    //osc1.stop(audioContext.currentTime + 1); // stop after a second

}

//attach a click listener to a play button
buttonOn.addEventListener("click", async () => {

  await audioContext.audioWorklet.addModule("rungler.js");
  const RunglerNode = new AudioWorkletNode(audioContext,"rungler");

  await audioContext.audioWorklet.addModule("osc-processor.js");
  const O1 = new AudioWorkletNode(audioContext,"osc-processor");
  const O2 = new AudioWorkletNode(audioContext,"osc-processor");
  O1.parameters.get('FRQ').value = 0;
  O1.parameters.get('RUN').value = 0;
  O2.parameters.get('FRQ').value = 0;
  O2.parameters.get('RUN').value = 0;

  if (audioContext === 'suspended'){
      audioContext.resume();
  }
	console.log("audio is ready");

  // start the oscillators
  tri01.start(); 
  tri02.start(); 
  pulse01.start(); 
  pulse02.start();
  // merge signals to pass them to the rungler circuit
  const merger = audioContext.createChannelMerger(2);
  pulse01.connect(merger, 0, 0);
  pulse02.connect(merger, 0, 1);
  merger.connect(RunglerNode);
  // split merger to separate run and xor signals
  const splitter = audioContext.createChannelSplitter(2);
  RunglerNode.connect(splitter); // out0: RUN, out1: XOR
  // connect rungler to osc frequencies
  splitter.connect(O1, 0, 0);
  O1.connect(tri01.frequency);
  splitter.connect(O2, 0, 0);
  O2.connect(tri02.frequency);
  RunglerNode.connect(gainNode).connect(out);

  frq01_Control.oninput = function (){
    O1.parameters.get('FRQ').value = this.value;
  }
  frq02_Control.oninput = function (){
    O2.parameters.get('FRQ').value = this.value;
  }
  run01_Control.oninput = function (){
    O1.parameters.get('RUN').value = this.value;
  }
  run02_Control.oninput = function (){
    O2.parameters.get('RUN').value = this.value;
  }
});


// CONTROLS
volumeControl.addEventListener("input", function(){
    gainNode.gain.value = volumeControl.value;
  },
  false,
);

// change frequencies
// frq01_Control.addEventListener("input", function(){
//     O1.parameters.get('FRQ').value = frq01_Control.value;
//   },
//   false,
// );

// frq02_Control.addEventListener("input", function(){
//     O2.parameters.get('FRQ').value = frq02_Control.value;
//   },
//   false,
// );

// rungler values
// run01_Control.addEventListener("input", function(){
//     O1.parameters.get('RUN').value = run01_Control.value;
//   },
//   false,
// );

// run02_Control.addEventListener("input", function(){
//     O2.parameters.get('RUN').value = run02_Control.value;
//   },
//   false,
// );

// filFrq_Control.addEventListener("input", function(){
//     biquadFilter.frequency.value = (2 ** ((filFrq_Control.value * 127 - 69) / 12)) * 440;
//   },
//   false,
// );


// assemble FM synth
// let tri01_gain = audioContext.createGain(); 
// tri01_gain.gain.value = 3000;
// let biquadFilter = audioContext.createBiquadFilter();
// biquadFilter.type = "lowpass";
// biquadFilter.Q.value = 2;
// biquadFilter.frequency = 0;
// tri01.connect(tri01_gain);
// tri01_gain.connect(tri02.frequency);
// tri02.connect(biquadFilter).connect(gainNode).connect(out);

// // self-feeding FM synth
// let tri = audioContext.createOscillator();
// tri.type = 'sawtooth';
// tri.frequency.value = 440;
// tri.start()
// let tri_gain = audioContext.createGain(); 
// tri_gain.gain.value = 500;
// const delay = audioContext.createDelay();
// delay.delayTime.value = 0.01;
// tri.connect(delay);
// delay.connect(tri_gain);
// tri_gain.connect(tri.frequency);
// tri.connect(gainNode).connect(out);
