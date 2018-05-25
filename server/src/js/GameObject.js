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