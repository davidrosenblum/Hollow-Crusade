import dark from '../lib/dark';
import MapData from './MapData';
import GameObjects from './GameObjects';
import Client from './Client';
import RequestSender from './RequestSender';
import UIController from './UIController';
import { Teams } from './Comm';

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
        this.updatePlayerMovementRef = null;

        this.mapLoaded = false;
        this.inBattle = false;
        this.battleNodes = {};
        
        this.CELL_SIZE = 96;
        this.CANVAS_WIDTH = 1280;
        this.CANVAS_HEIGHT = 720;

        dark.TextField.DEFAULT_FONT = "1em arial";
        dark.GameObject.NAMETAG_FONT = "1em arial";

        dark.stage.addChild(this.background);
        dark.stage.addChild(this.scene);
        dark.stage.addChild(this.foreground);
    }

    loadMap(name){
        let mapData = MapData.getMapData(name);
        if(!mapData){
            throw new Error(`Bad map ${name}!`);
        }

        dark.init("#canvas-container", this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

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
            mapData.background[0].length * this.CELL_SIZE,
            mapData.background.length * this.CELL_SIZE
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
        this.inBattle = false;

        /* remove this later... */
        window.dark = dark;
        window.game = this;
        //dark.stage.showHitboxes = true;
    }

    unloadMap(){
        if(!this.mapLoaded){
            return;
        }

        //dark.kill();

        this.background.removeChildren();
        this.scene.removeChildren();
        this.foreground.removeChildren();

        // remove scroll
        this.background.x = 0;
        this.background.y = 0;
        this.scene.x = 0;
        this.scene.y = 0;
        this.foreground.x = 0;
        this.foreground.y = 0;

        this.collidables = null;
        this.mapBounds = null;
        this.scroller = null;
        this.objectManager.clearObjects();

        this.releasePlayer();
        this.targetObject = null;

        this.inBattle = false;
        this.battleNodes = {};

        UIController.hudTarget(null);

        this.mapLoaded = false;
    }

    enterBattle(){
        this.inBattle = true;
        this.clearTarget();
        this.scroller.lookAt(this.player);
        // UIController.showBattle...? 
    }

    handleSelectTarget(evt){
        if(this.inBattle){
            return;
        }

        let target = evt.target;
        this.targetObject = evt.target;
        RequestSender.objectStats(target.objectID || -1);
    }

    clearTarget(){
        UIController.hudTarget(null);
        this.targetObject = null;
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
        let classType = this.formatClassNameString(data.type),
            objectClass = GameObjects.getClass(classType);

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

            if(object.teamID === Teams.ENEMIES){
                object.nametagFill = "darkred";
            }
            else if(object.teamID === Teams.PLAYERS){
                object.nametagFill = "orange";
            }

            if(data.type === "player"){
                // players have skins
                if(typeof data.skinID === "number"){
                    object.setSkin(data.skinID);
                }

                // belong to this client? 
                if(object.ownerID === Client.socketID){
                    console.log("player found!");
                    this.setPlayer(object);
                    RequestSender.objectStats(object.objectID);
                    
                    object.nametagFill = "white";
                }
            }

            if(this.objectManager.addObject(object)){
                this.scene.addChild(object);
                this.scene.depthSort();

                object.on(dark.Event.CLICK, this.handleSelectTarget.bind(this));
            }
        }
        else throw new Error(`Unable to create object of type ${classType}.`);
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

        // Client doesnt recieve this unless server moved the player
        if(this.player && data.objectID === this.player.objectID){
            this.scroller.lookAt(this.player);
        }
    }

    createBattleNode(data){

        let type = GameObjects.getClass("BattleNode");

        let node = new type();
        this.battleNodes[data.nodeID] = node;
        
        node.x = data.x + (this.CELL_SIZE * 2) - (node.width / 2);
        node.y = data.y - this.CELL_SIZE;
        node.nodeID = data.nodeID;
        node.type = "battle-node";

        node.on(dark.Event.CLICK, evt => {
            if(!this.inBattle){
                RequestSender.battleEnter(node.nodeID);
            }
        });

        this.foreground.addChild(node);
    }

    deleteBattleNode(nodeID){
        let node = this.battleNodes[nodeID];
        if(node){
            this.foreground.removeChild(node);
            delete this.battleNodes[nodeID];
        }
    }

    updatePlayerSkin(objectID, skinID){
        let object = this.objectManager.getObject(objectID);
        if(object && object instanceof GameObjects.Player){
            object.setSkin(skinID);
        }
    }

    updatePlayerMovement(evt){
        if(this.keyHandler.numKeys > 0 && (document.activeElement instanceof window.HTMLInputElement === false) && !this.inBattle){
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
        this.updatePlayerMovementRef = this.updatePlayerMovement.bind(this);
        dark.stage.on(dark.Event.TICK, this.updatePlayerMovementRef);

        this.scroller.lookAt(this.player);
    }

    releasePlayer(){
        if(this.player){
            dark.stage.removeListener(dark.Event.TICK, this.updatePlayerMovementRef);
            this.player = null;
            this.updatePlayerMovementRef = null;
        }
    }
};

// export as singleton 
export default new GameController();