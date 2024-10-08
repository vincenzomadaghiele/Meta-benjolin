const x = 0.5;
const y = 0.5;
const z = 0.5;

var x_slider = document.getElementById("x-slider");
var y_slider = document.getElementById("y-slider");
var z_slider = document.getElementById("z-slider");
x_slider.oninput = function() {
    x = this.value;
    sliderToPD(x, y, z);
    console.log(this.value)
} 


function sliderToPD(x, y, z){

    sendMsgToWebPd('n_0_15', '0', [fRQ01_slider_value]); 
    sendMsgToWebPd('n_0_16', '0', [rUN01_slider_value]); 
    sendMsgToWebPd('n_0_17', '0', [fRQ02_slider_value]); 
    sendMsgToWebPd('n_0_18', '0', [rUN02_slider_value]); 
    
    sendMsgToWebPd('n_0_19', '0', [fILFRQ_slider_value]); 
    sendMsgToWebPd('n_0_20', '0', [fILRES_slider_value]); 
    sendMsgToWebPd('n_0_21', '0', [fILRUN_slider_value]); 
    sendMsgToWebPd('n_0_22', '0', [fILSWP_slider_value]); 

}

