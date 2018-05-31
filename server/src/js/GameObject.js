/*
    GameObject
    'abstract' superclass for all game objects
    includes positioning, animation, and ID information 

    (David)
*/

// import modules
let EventEmitter = require("./EventEmitter");

let GameObject = class GameObject extends EventEmitter{
    constructor(opts){
        opts = (!opts) ? {} : opts;
        
        super();

        this.x = (typeof opts.x === "number") ? opts.x : 0;
        this.y = (typeof opts.y === "number") ? opts.y : 0;
        this.anim = (typeof anim === "string") ? opts.anim : null;
        this.objectID = (typeof opts.objectID === "number") ? opts.objectID : -1;
    }

    // updates the object's 'x', 'y', and 'anim' values if they are the acceptable datatype 
    applyUpdate(data){
        if(typeof data.x === "number"){
            this.x = data.x;
        }

        if(typeof data.y === "number"){
            this.y = data.y;
        }

        if(typeof data.anim === "string"){
            this.anim = data.anim;
        }
    };

    // creates an object that includes the objectID, x, y, and anim values 
    getData(){
        return {
            objectID: this.objectID,
            x: this.x,
            y: this.y,
            anim: this.anim
        };
    }
};

module.exports = GameObject;