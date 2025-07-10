const buttonOn = document.querySelector('#audioOn');
const volumeControl = document.querySelector("#volume");
const frq01_Control = document.querySelector("#FRQ01");
const frq02_Control = document.querySelector("#FRQ02");

//attach a click listener to a play button
buttonOn.addEventListener("click", async () => {
	await Tone.start();
	console.log("audio is ready");
});

// BENJOLIN
// oscillators
const tri01 = new Tone.Oscillator(440, "triangle8"); //.toDestination().start();
const pulse01 = new Tone.Oscillator(440, "square"); //.toDestination().start();
const tri02 = new Tone.Oscillator(440, "triangle8"); //.toDestination().start();
const pulse02 = new Tone.Oscillator(440, "square"); //.toDestination().start();

const filter = new Tone.Filter(500, "highpass");

const effect4 = new Tone.Freeverb();
tri01.connect(effect4).toDestination();
//effect4.toDestination();


// audio graph
tri01.connect(filter);
filter.toDestination();

volumeControl.addEventListener("input", function(){
    tri01.volume.value = volumeControl.value * 40 - 40;
    pulse01.volume.value = volumeControl.value * 40 - 40;
  },
  false,
);

// change frequencies
frq01_Control.addEventListener("input", function(){
    tri01.frequency.value = (2 ** ((frq01_Control.value * 127 - 69) / 12)) * 440;
    pulse01.frequency.value = (2 ** ((frq01_Control.value * 127 - 69) / 12)) * 440;
  },
  false,
);

frq02_Control.addEventListener("input", function(){
    tri02.frequency.value = (2 ** ((frq02_Control.value * 127 - 69) / 12)) * 440;
    pulse02.frequency.value = (2 ** ((frq02_Control.value * 127 - 69) / 12)) * 440;
  },
  false,
);
