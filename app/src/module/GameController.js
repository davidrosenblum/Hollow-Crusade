import dark from '../lib/dark';
import MapData from './MapData';

let Game = class Game extends dark.EventEmitter{
    constructor(){
        super();
        this.background = new dark.DisplayObjectContainer();
        this.scene = new dark.DisplayObjectContainer();
        this.foreground = new dark.DisplayObjectContainer();

        this.keyHandler = new dark.KeyHandler(window);
        this.objectManager = new dark.ObjectManager();

        this.collisionGrid = null;
        this.mapBounds = null;
        this.scroller = null;

        this.player = null;
    }

    loadMap(id){
        console.log(`LOAD ${id}`);
    }

    unloadMap(){
        console.log("UNLOAD");
    }

    updatePlayerMovement(evt){
        if(this.keyHandler.numKeys > 0){
            if(this.keyHandler.isKeyDown(87)){
                this.player.moveUp(this.collisionGrid, this.mapBounds, this.scroller);
            }
            else if(this.keyHandler.isKeyDown(83)){
                this.player.moveDown(this.collisionGrid, this.mapBounds, this.scroller);
            }

            if(this.keyHandler.isKeyDown(65)){
                this.player.moveLeft(this.collisionGrid, this.mapBounds, this.scroller);
            }
            else if(this.keyHandler.isKeyDown(68)){
                this.player.moveRight(this.collisionGrid, this.mapBounds, this.scroller);
            }
        }
    }

    setPlayer(object){
        if(this.player){
            this.removeListener(dark.Event.DRAW, this.updatePlayerMovement.bind(this));
        }

        this.player = object;
        this.on(dark.Event.DRAW, this.updatePlayerMovement.bind(this));
    }
};

// export as singleton 
export default new Game();