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
