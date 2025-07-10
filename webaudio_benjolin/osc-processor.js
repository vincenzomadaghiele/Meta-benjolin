// osc-processor.js
class OscProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() { return [
        { name: "FRQ", defaultValue: 50 }, { name: "RUN", defaultValue: 100 }
    ] }
    process(inputs, outputs, parameters) {

        let inChannelRun = inputs[0][0]; 
        let outChannel = outputs[0][0]; 
        let FRQ = parameters.FRQ / 128 * 141 - 61;
        let RUN = parameters.RUN / 2;

        for (let i = 0; i < outChannel.length; i++) {
            // sample by sample
            let outValue = inChannelRun[i] * RUN + FRQ;
            // clip within values
            if (outValue < -60){ outValue = -60 }
            if (outValue > 127){ outValue = 127 }
            // mtof
            outChannel[i] = (2 ** ((outValue - 69) / 12)) * 440;
        }

        return true;
    }
}
registerProcessor("osc-processor", OscProcessor);

