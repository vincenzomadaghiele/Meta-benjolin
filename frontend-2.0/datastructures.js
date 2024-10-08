// COMPOSITION FUNCTIONALITIES
class Box{
    constructor(x, y, z, duration, arrayIndex){
        this.x = x;
        this.y = y;
        this.z = z;
        this.duration = duration;
        this.arrayIndex = arrayIndex; // index in the array
    }
}
class Meander{
    constructor(duration){
        this.duration = duration;
    }
}
class Crossfade{
    constructor(duration){
        this.duration = duration;
    }
}

const compositionArray = [];
