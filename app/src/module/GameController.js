import dark from '../lib/dark';
import MapData from './MapData';
import GameObjects from './GameObjects';
import Client from './Client';

let GameController = class GameController extends dark.EventEmitter{
    constructor(){
        super();
        this.background = new dark.DisplayObjectContainer();
        this.scene = new dark.DisplayObjectContainer();
        this.foreground = new dark.DisplayObjectContainer();

        this.keyHandler = new dark.KeyHandler(document.body);
        this.objectManager = new dark.ObjectManager();

        this.collisionGrid = null;
        this.mapBounds = null;
        this.scroller = null;

        this.player = null;

        this.mapLoaded = false;

        this.CELL_SIZE = 96;
    }

    loadMap(id){
        let mapData = MapData.getMapData(id);
        if(!mapData){
            throw new Error("Bad map!");
        }

        if(this.mapLoaded){
            this.unloadMap();
        }

        dark.MapBuilder.buildGrid(
            mapData.background,
            mapData.backgroundTypes,
            this.CELL_SIZE,
            this.background,
            false
        
        );

        this.collisionGrid = dark.MapBuilder.buildGrid(
            mapData.scene,
            mapData.sceneTypes,
            this.CELL_SIZE,
            this.scene,
            true
        );

        dark.MapBuilder.buildGrid(
            mapData.foreground,
            mapData.foregroundTypes,
            this.CELL_SIZE, 
            this.foreground,
            false
        );

        this.mapBounds = new dark.Bounds(
            0,
            0,
            mapData.scene[0].length * this.CELL_SIZE,
            mapData.scene.length * this.CELL_SIZE
        );

        this.scroller = new dark.Scroller([this.background, this.scene, this.foreground], this.mapBounds);

        this.mapLoaded = true;
    }

    unloadMap(){
        if(!this.mapLoaded){
            return;
        }

        this.background.removeChildren();
        this.scene.removeChildren();
        this.foreground.removeChildren();

        this.collisionGrid = null;
        this.mapBounds = null;
        this.scroller = null;
        this.objectManager.clearObjects();

        this.mapLoaded = false;
    }

    // converts 'my-object-type' to 'MyObjectType'
    formatClassNameString(str){
        let formattedString = "";

        let split = str.split("-");
        for(let elem of split){
            formattedString += elem.charAt(0).toUpperCase();
            formattedString += elem.substring(1, elem.length).toLowerCase();
        }

        return formattedString;
    }

    createObject(data){
        let objectClass = GameObjects.getClass(this.formatClassNameString(data.type));

        if(objectClass){
            let object = new objectClass();
            object.moveSpeed = data.moveSpeed || 1;
            object.ownerID = data.ownerID || -1;
            object.teamID = data.teamID || -1;
            object.objectID = data.objectID || -1;
            object.x = data.x || 0;
            object.y = data.y || 0;

            if(data.name){
                object.nametag(data.name);
            }

            if(data.type === "player"){
                // players have skins
                if(typeof data.skinID === "number"){
                    object.changeImage(GameObjects.getSkin(data.skinID));
                }

                // belong to this client? 
                if(object.ownerID === Client.socketID){
                    console.log("player found!");
                    this.setPlayer(object);
                }
            }

            if(this.objectManager.addObject(object)){
                this.scene.addChild(object);
                this.scene.depthSort();
            }
        }
    }

    deleteObject(id){
        let object = this.objectManager.getObject(id);
        if(object){
            this.objectManager.removeObject(id);
            object.remove();
        }
    }

    updateObject(data){
        this.objectManager.updateObject(data);
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
export default new GameController();