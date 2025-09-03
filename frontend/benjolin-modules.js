// The Benjolin is a chaotic synthesizer designed by Rob Hordjik
// This WebAudio Benjolin implementation is based on Derek Holzer's Pure Data Benjolin: https://github.com/macumbista/benjolin
// Copyright 2025 Vincenzo Madaghiele and Derek Holzer. vincenzo.madaghiele@gmail.com


// rungler.js
class Rungler extends AudioWorkletProcessor {
    constructor(){
        super();
        this.sh01 = 0;
        this.sh02 = 0;
        this.sh03 = 0;
        this.sh04 = 0;
        this.sh05 = 0;
        this.sh06 = 0;
        this.sh07 = 0;
        this.sh08 = 0;
    }
    process(inputs, outputs, parameters) {
        let pls01 = inputs[0][0]; 
        let pls02 = inputs[0][1]; 
        let run = outputs[0][0]; 
        let xor = outputs[0][1]; 

        for (let i = 0; i < run.length; i++) {

            let zz = 0
            if (pls01[i] > 0.5){
                zz = 1;
            } else {
                zz = 0;
            }
            zz = zz ^ this.sh01;
            xor[i] = zz;

            let xx = 0
            if (pls02[i] > 0){
                xx = 1;
            } else {
                xx = 0;
            }

            // sample
            if (xx == 1){
                this.sh08 = this.sh07;
                this.sh07 = this.sh06;
                this.sh06 = this.sh05;
                this.sh05 = this.sh04;
                this.sh04 = this.sh03;
                this.sh05 = this.sh02;
                this.sh02 = this.sh01;
                this.sh01 = zz;
            }

            // sample by sample
            run[i] = (this.sh06/8) + (this.sh07/4) + (this.sh08/2);
        }
        return true;
    }
}
registerProcessor("rungler", Rungler);


// osc-processor.js
class OscProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() { return [
        { name: "FRQ", defaultValue: 50 }, { name: "RUN", defaultValue: 100 }
    ] }
    process(inputs, outputs, parameters) {

        let inChannelRun = inputs[0][0]; 
        let outChannel = outputs[0][0]; 
        let FRQ = parameters.FRQ[0] / 128 * 141 - 61;
        let RUN = parameters.RUN[0] / 2;
        for (let i = 0; i < outChannel.length; i++) {
            // sample by sample
            let outValue = inChannelRun[i] * RUN + FRQ;
            // // clip within values
            outValue = Math.min(Math.max(outValue, -60), 127);
            // mtof
            outChannel[i] = (2 ** ((outValue - 69) / 12)) * 440;
        }
        return true;
    }
}
registerProcessor("osc-processor", OscProcessor);


class Comparator extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        let tri01 = inputs[0][0]; 
        let tri02 = inputs[0][1]; 
        let outSignal = outputs[0][0]; 

        for (let i = 0; i < outSignal.length; i++) {
            if (tri01 > tri02){
                outSignal[i] = 1;
            } else {
                outSignal[i] = 0;
            }
        }
        return true;
    }
}
registerProcessor("comparator", Comparator);


// filter-freq.js
class ComputeFilterFreq extends AudioWorkletProcessor {
    static get parameterDescriptors() { return [
        { name: "FIL_FRQ", defaultValue: 50 }, { name: "FIL_RUN", defaultValue: 100 },
        { name: "FIL_SWP", defaultValue: 100 }
    ] }
    process(inputs, outputs, parameters) {

        let inChannelRun = inputs[0][0]; 
        let tri02 = inputs[0][1]; 
        let outChannel = outputs[0][0]; 
        let FIL_FRQ = parameters.FIL_FRQ[0];
        let FIL_RUN = parameters.FIL_RUN[0] / 127;
        let FIL_SWP = parameters.FIL_SWP[0] / 127;

        for (let i = 0; i < outChannel.length; i++) {
            let outValue = FIL_FRQ + (FIL_RUN * inChannelRun[i] * 127) + (FIL_SWP * tri02[i] * 127);
            // clamp value
            outValue = Math.min(Math.max(outValue, 0), 127);
            // mtof
            outChannel[i] = (2 ** ((outValue - 69) / 12)) * 440;
        }
        return true;
    }
}
registerProcessor("filter-freq", ComputeFilterFreq);
