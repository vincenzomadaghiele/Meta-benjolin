// The Benjolin is a chaotic synthesizer designed by Rob Hordjik
// This WebAudio Benjolin implementation is based on Derek Holzer's Pure Data Benjolin: https://github.com/macumbista/benjolin
// Copyright 2025 Vincenzo Madaghiele and Derek Holzer. vincenzo.madaghiele@gmail.com

// get buttons and sliders
const buttonOn = document.querySelector('#audioOn');
const buttonOff = document.querySelector('#audioOff');
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

// activate audio context
buttonOn.addEventListener("click", function (){
    audioContext.resume();
    console.log('starting audio context')
})
// activate audio context
buttonOff.addEventListener("click", function (){
    audioContext.suspend();
    console.log('suspending audio context')
})

// load modules and create benjolin
audioContext.audioWorklet.addModule("benjolin-modules.js").then(() => {
    
    // CREATE BENJOLIN
    const myBenjolin = new Benjolin(0, 0, 0, 0, 0, 0, 0, 0, 0, audioContext);

    // CONTROL BENJOLIN WITH SLIDERS
    volumeControl.oninput = function (){ myBenjolin.changeGain(volumeControl.value); }
    frq01_Control.oninput = function (){ myBenjolin.change01FRQ(frq01_Control.value); }
    frq02_Control.oninput = function (){ myBenjolin.change02FRQ(frq02_Control.value); }
    run01_Control.oninput = function (){ myBenjolin.change01RUN(run01_Control.value); }
    run02_Control.oninput = function (){ myBenjolin.change02RUN(run02_Control.value); }
    filFrq_Control.oninput = function (){ myBenjolin.changeFIL_FRQ(filFrq_Control.value); }
    filRes_Control.oninput = function (){ myBenjolin.changeFIL_RES(filRes_Control.value); }
    filRun_Control.oninput = function (){ myBenjolin.changeFIL_RUN(filRun_Control.value); }
    filSwp_Control.oninput = function (){ myBenjolin.changeFIL_SWP(filSwp_Control.value); }

    // functions to update sliders and parameter values
    function changeGain(value){ volumeControl.value = value; myBenjolin.changeGain(value); }
    function change01FRQ(value){ frq01_Control.value = value; myBenjolin.change01FRQ(value); }
    function change02FRQ(value){ frq02_Control.value = value; myBenjolin.change02FRQ(value); }
    function change01RUN(value){ run01_Control.value = value; myBenjolin.change01RUN(value); }
    function change02RUN(value){ run02_Control.value = value; myBenjolin.change02RUN(value); }
    function changeFIL_FRQ(value){ filFrq_Control.value = value;  myBenjolin.changeFIL_FRQ(value); }
    function changeFIL_RES(value){ filRes_Control.value = value; myBenjolin.changeFIL_RES(value); }
    function changeFIL_RUN(value){ filRun_Control.value = value;  myBenjolin.changeFIL_RUN(value); }
    function changeFIL_SWP(value){ filSwp_Control.value = value;  myBenjolin.changeFIL_SWP(value); }

    // scramble parameters
    randomButton.addEventListener("click", function (){
        console.log('scrambling parameters');
        change01FRQ(Math.random() * 127);
        change02FRQ(Math.random() * 127);
        change01RUN(Math.random() * 127);
        change02RUN(Math.random() * 127);
        changeFIL_FRQ(Math.random() * 127);
        changeFIL_RES(Math.random() * 127);
        changeFIL_RUN(Math.random() * 127);
        changeFIL_SWP(Math.random() * 127);
    })
})

