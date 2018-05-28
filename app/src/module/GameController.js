import dark from '../lib/dark';
import MapData from './MapData';
import GameObjects from './GameObjects';
import Client from './Client';
import RequestSender from './RequestSender';

let GameController = class GameController extends dark.EventEmitter{
    constructor(){
        super();
        this.background = new dark.DisplayObjectContainer();
        this.scene = new dark.DisplayObjectContainer();
        this.foreground = new dark.DisplayObjectContainer();

        this.keyHandler = new dark.KeyHandler(document.body);
        this.objectManager = new dark.ObjectManager();

        this.collidables = null;
        this.mapBounds = null;
        this.scroller = null;

        this.player = null;
        this.targetObject = null;

        this.mapLoaded = false;

        this.CELL_SIZE = 96;
        this.CANVAS_WIDTH = 1280;
        this.CANVAS_HEIGHT = 720;

        dark.TextField.DEFAULT_FONT = "18px arial";
        dark.GameObject.NAMETAG_FONT = "16px arial";

        dark.stage.addChild(this.background);
        dark.stage.addChild(this.scene);
        dark.stage.addChild(this.foreground);
    }

    loadMap(id){
        let mapData = MapData.getMapData(id);
        if(!mapData){
            throw new Error("Bad map!");
        }

        if(this.mapLoaded){
            this.unloadMap();
        }

        dark.init("#canvas-container", this.CANVAS_WIDTH, this.CANVAS_HEIGHT, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        dark.MapBuilder.buildGrid(
            mapData.background,
            mapData.backgroundTypes,
            this.CELL_SIZE,
            this.background,
            false
        
        );

        dark.MapBuilder.buildGrid(
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

        this.collidables = [];
        this.scene.forEachChild(child => {
            if(child instanceof dark.GameObject === false){
                this.collidables.push(child);
            }
        });
        
        this.scene.depthSort();

        this.mapLoaded = true;

        /* remove this later... */
        window.dark = dark;
        window.game = this;
        //dark.stage.showHitboxes = true;
    }

    unloadMap(){
        if(!this.mapLoaded){
            return;
        }

        this.background.removeChildren();
        this.scene.removeChildren();
        this.foreground.removeChildren();

        this.collidables = null;
        this.mapBounds = null;
        this.scroller = null;
        this.objectManager.clearObjects();

        dark.kill();
        this.mapLoaded = false;
    }

    handleSelectTarget(evt){
        let target = evt.target;
        this.targetObject = evt.target;
        RequestSender.objectStats(target.objectID || -1);
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
                    RequestSender.objectStats(object.objectID);
                }
            }

            if(this.objectManager.addObject(object)){
                this.scene.addChild(object);
                this.scene.depthSort();

                object.on(dark.Event.CLICK, this.handleSelectTarget.bind(this));
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
        if(this.keyHandler.numKeys > 0 && (document.activeElement instanceof window.HTMLInputElement === false)){
            if(this.keyHandler.isKeyDown(87)){
                this.player.moveUp(this.collidables, this.mapBounds, this.scroller);
                this.playerUpdated();
            }
            else if(this.keyHandler.isKeyDown(83)){
                this.player.moveDown(this.collidables, this.mapBounds, this.scroller);
                this.playerUpdated();
            }

            if(this.keyHandler.isKeyDown(65)){
                this.player.moveLeft(this.collidables, this.mapBounds, this.scroller);
                this.playerUpdated();
            }
            else if(this.keyHandler.isKeyDown(68)){
                this.player.moveRight(this.collidables, this.mapBounds, this.scroller);
                this.playerUpdated();
            }
        }
    }

    playerUpdated(){
        RequestSender.objectUpdate(this.player.getData());
        this.scene.depthSort();
    }

    setPlayer(object){
        this.releasePlayer();

        this.player = object;
        dark.stage.on(dark.Event.DRAW, this.updatePlayerMovement.bind(this));
    }

    releasePlayer(){
        if(this.player){
            dark.stage.removeListener(dark.Event.DRAW, this.updatePlayerMovement.bind(this));
            this.player = null;
        }
    }
};

// export as singleton 
export default new GameController();