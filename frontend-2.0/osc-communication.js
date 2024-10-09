var port = new osc.WebSocketPort({
    url: "ws://localhost:8081"
});

let MEANDERS_LIST = [];
port.on("message", function (oscMessage) {
    $("#message").text(JSON.stringify(oscMessage, undefined, 2));
    MEANDERS_LIST.push(oscMessage.args[0].split("-"));
    //console.log(meanders)
    //console.log("message", oscMessage.args[0].split("-"));
    //console.log("message", oscMessage[0].split("-"));
});

port.open();

var sendBox = function (send_x, send_y, send_z){
    port.send({
        address: "/play/box",
        args: [
            {
                type: "f",
                value: send_x
            },
            {
                type: "f",
                value: send_y
            },
            {
                type: "f",
                value: send_z
            }
        ]
    });
}

var sendMeander = function (send_start_x, send_start_y, send_start_z, send_end_x, send_end_y, send_end_z, meander_time){
    port.send({
        address: "/play/meander",
        args: [
            {
                type: "f",
                value: send_start_x
            },
            {
                type: "f",
                value: send_start_y
            },
            {
                type: "f",
                value: send_start_z
            },
            {
                type: "f",
                value: send_end_x
            },
            {
                type: "f",
                value: send_end_y
            },
            {
                type: "f",
                value: send_end_z
            },
            {
                type: "f",
                value: meander_time
            }

        ]
    });
}

var sendDrawMeander = function (send_start_x, send_start_y, send_start_z, send_end_x, send_end_y, send_end_z){
    port.send({
        address: "/draw/meander",
        args: [
            {
                type: "f",
                value: send_start_x
            },
            {
                type: "f",
                value: send_start_y
            },
            {
                type: "f",
                value: send_start_z
            },
            {
                type: "f",
                value: send_end_x
            },
            {
                type: "f",
                value: send_end_y
            },
            {
                type: "f",
                value: send_end_z
            },
        ]
    });
}

var sendCrossfade = function (send_start_x, send_start_y, send_start_z, send_end_x, send_end_y, send_end_z, meander_time){
    port.send({
        address: "/play/crossfade",
        args: [
            {
                type: "f",
                value: send_start_x
            },
            {
                type: "f",
                value: send_start_y
            },
            {
                type: "f",
                value: send_start_z
            },
            {
                type: "f",
                value: send_end_x
            },
            {
                type: "f",
                value: send_end_y
            },
            {
                type: "f",
                value: send_end_z
            },
            {
                type: "f",
                value: meander_time
            }

        ]
    });
}

var sendStop = function (){
    port.send({
        address: "/stop",
        args: []
    });
}
