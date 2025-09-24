// The Benjolin is a chaotic synthesizer designed by Rob Hordjik
// This WebAudio Benjolin implementation is based on Derek Holzer's Pure Data Benjolin: https://github.com/macumbista/benjolin
// Copyright 2025 Vincenzo Madaghiele and Derek Holzer. vincenzo.madaghiele@gmail.com

class Benjolin {
    constructor(gain, FRQ01, FRQ02, RUN01, RUN02, FIL_FRQ, FIL_RES, FIL_RUN, FIL_SWP, audioContext) {

        // MAIN PARAMETERS
        this.gain = gain;
        this.FRQ01 = FRQ01;
        this.FRQ02 = FRQ02;
        this.RUN01 = RUN01;
        this.RUN02 = RUN02;
        this.FIL_FRQ = FIL_FRQ;
        this.FIL_RES = FIL_RES;
        this.FIL_RUN = FIL_RUN;
        this.FIL_SWP = FIL_SWP;
        this.audioContext = audioContext;

        // CREATE NODES
        // MAIN OSCILLATORS
        let tri01 = this.audioContext.createOscillator();
        let pulse01 = this.audioContext.createOscillator();
        let tri02 = this.audioContext.createOscillator();
        let pulse02 = this.audioContext.createOscillator();
        // CUSTOM NODES
        this.O1 = new AudioWorkletNode(this.audioContext,"osc-processor");
        this.O2 = new AudioWorkletNode(this.audioContext,"osc-processor");
        this.biquadFilter = this.audioContext.createBiquadFilter();
        this.filterFreq = new AudioWorkletNode(this.audioContext,"filter-freq");
        this.gainCompensationNode = this.audioContext.createGain(); 
        this.gainNode = this.audioContext.createGain(); 
        let RunglerNode = new AudioWorkletNode(this.audioContext,"rungler");
        let comparator = new AudioWorkletNode(this.audioContext,"comparator");
        // hipass
        let hiPassFilter = this.audioContext.createBiquadFilter();
        // compressor
        const compressor = this.audioContext.createDynamicsCompressor();
        const limiter = this.audioContext.createDynamicsCompressor();

        // SET PARAMETER VALUES
        // main parameters
        this.O1.parameters.get('FRQ').value = 0;
        this.O1.parameters.get('RUN').value = 0;
        this.O2.parameters.get('FRQ').value = 0;
        this.O2.parameters.get('RUN').value = 0;
        this.filterFreq.parameters.get('FIL_FRQ').value = 0;
        this.filterFreq.parameters.get('FIL_RUN').value = 0;
        this.filterFreq.parameters.get('FIL_SWP').value = 0;
        // filter params
        this.biquadFilter.type = "lowpass";
        this.biquadFilter.Q.value = 1;
        this.biquadFilter.frequency.value = 0;
        // oscillators params
        tri01.type = 'triangle';
        tri01.frequency.value = 0;
        pulse01.type = 'square';
        pulse01.frequency.value = 0;
        tri02.type = 'triangle';
        tri02.frequency.value = 0;
        pulse02.type = 'square';
        pulse02.frequency.value = 0;
        // hipass
        hiPassFilter.type = "highpass";
        hiPassFilter.Q.value = 2;
        hiPassFilter.frequency.value = 50;
        // compressor
        compressor.threshold.value = -50;
        compressor.knee.value = 20;
        compressor.ratio.value = 16;
        compressor.attack.value = 0;
        compressor.release.value = 0.2;

        limiter.threshold.value = -15;
        limiter.knee.value = 5;
        limiter.ratio.value = 100;
        limiter.attack.value = 0;
        limiter.release.value = 0.01;

        // start oscillators
        tri01.start()
        pulse01.start()
        tri02.start()
        pulse02.start()

        // create audio graph
        // merge signals to pass them to the rungler circuit
        const merger = this.audioContext.createChannelMerger(2);
        pulse01.connect(merger, 0, 0); // substitute with pulse
        pulse02.connect(merger, 0, 1); // substitute with pulse
        // RUNGLER
        merger.connect(RunglerNode);
        // split merger to separate run and xor signals
        const splitter = this.audioContext.createChannelSplitter(2);
        RunglerNode.connect(splitter); // out0: RUN, out1: XOR
        // connect rungler to osc frequencies
        splitter.connect(this.O1, 0, 0);
        const delayedO1 = this.audioContext.createDelay();
        delayedO1.delayTime.value = 0.0001;
        this.O1.connect(delayedO1);
        delayedO1.connect(tri01.frequency);
        delayedO1.connect(pulse01.frequency); // send to rungler
        this.O2.parameters.get('RUN').value = 0;
        splitter.connect(this.O2, 0, 0);
        const delayedO2 = this.audioContext.createDelay();
        delayedO2.delayTime.value = 0.0001;
        this.O2.connect(delayedO2);
        delayedO2.connect(tri02.frequency);
        delayedO2.connect(pulse02.frequency); // send to rungler
        // COMPARATOR
        const merger2compare = this.audioContext.createChannelMerger(2);
        tri01.connect(merger2compare, 0, 0); // substitute with pulse
        tri02.connect(merger2compare, 0, 1); // substitute with pulse
        merger2compare.connect(comparator);
        const reSplitter = this.audioContext.createChannelSplitter(2);
        comparator.connect(reSplitter);
        let halfGainNode = this.audioContext.createGain(); 
        halfGainNode.gain.value = 0.5;
        reSplitter.connect(halfGainNode, 0, 0);
        splitter.connect(halfGainNode, 0, 0);
        // compute dynamic filter frequency
        const merger4frequency = this.audioContext.createChannelMerger(2);
        RunglerNode.connect(merger4frequency, 0, 0); // substitute with pulse
        tri02.connect(merger4frequency, 0, 1); // substitute with pulse
        merger4frequency.connect(this.filterFreq);
        this.filterFreq.connect(this.biquadFilter.frequency);
        // main filter and gain compensation
        halfGainNode.connect(this.biquadFilter).connect(this.gainCompensationNode);
        this.gainCompensationNode.connect(hiPassFilter).connect(compressor).connect(this.gainNode).connect(limiter).connect(this.audioContext.destination);

    }
    changeGain(value){  this.gainNode.gain.value = value;  this.gain = value;  }
    change01FRQ(value){  this.O1.parameters.get('FRQ').value = value; this.FRQ01 = value; }
    change02FRQ(value){ this.O2.parameters.get('FRQ').value = value; this.FRQ02 = value; }
    change01RUN(value){ this.O1.parameters.get('RUN').value = value; this.RUN01 = value; }
    change02RUN(value){ this.O2.parameters.get('RUN').value = value; this.RUN02 = value; }
    changeFIL_FRQ(value){ this.filterFreq.parameters.get('FIL_FRQ').value = value; this.FIL_FRQ = value;}
    changeFIL_RES(value){ 
        this.biquadFilter.Q.value = value / 128 * 33 - 3; 
        this.gainCompensationNode.gain.value = value / 128 * 10 + 2;
        this.FIL_RES = value;
    }
    changeFIL_RUN(value){ this.filterFreq.parameters.get('FIL_RUN').value = value; this.FIL_RUN = value; }
    changeFIL_SWP(value){ this.filterFreq.parameters.get('FIL_SWP').value = value; this.FIL_SWP = value; }

} 

export { Benjolin };