/*
    Room
    holds sockets, objects, and battle nodes 
    helps keep everything synchronized between clients 
    server does the syncing by listening for events (each room doesnt have a ref to the TCP/UDP servers)
    
    (David)
*/

// import modules
let EventEmitter = require("./EventEmitter"),
    GameEvent = require("./GameEvent"),
    BattleNode = require("./BattleNode"),
    PortalNode = require("./PortalNode"),
    Owner = require("./Comm").Owners,
    Teams = require("./Comm").Teams;

let Room = class Room extends EventEmitter{
    constructor(roomID, roomName, minLevel=1, startLocX=100, startLocY=100){
        super();

        this.roomID = roomID;
        this.roomName = roomName;
        this.minLevel = minLevel;
        this.startLocation = {
            x: startLocX,
            y: startLocY
        };

        // dicts of sockets, objects, and battle nodes 
        this.sockets = {};
        this.objects = {};
        this.battleNodes = {};
        this.portalNodes = {};

        this.lastObjectID = 0;
    }

    // creates and storse a battle node, attaches event listeners and re-emits certain events
    createBattleNode(x, y, npcs, ownerID=Owner.ENEMIES, teamID=Teams.ENEMIES){
        // create and store node
        let node = new BattleNode(x, y, ownerID, teamID, npcs);
        this.battleNodes[node.nodeID] = node;

        // attach enemy listeners, remove/add objects that the battle node does (battle node acts as a spawner)
        node.on(GameEvent.BATTLE_ADD_ENEMY, evt => this.addObject(evt.target));
        node.on(GameEvent.BATTLE_REMOVE_ENEMY, evt => this.removeObject(evt.target));

        // re-emit player adds (server will be listening)
        node.on(GameEvent.BATTLE_ADD_PLAYER, evt => this.bubble(evt));

        // re-emit player removes (server will be listening)
        node.on(GameEvent.BATTLE_REMOVE_PLAYER, evt => this.bubble(evt));

        // re-emit battle ends (server will be listening)
        node.on(GameEvent.BATTLE_END, evt => {
            this.bubble(evt);
            this.deleteBattleNode(node);
        });

        // emit new battles
        this.emit(new GameEvent(GameEvent.BATTLE_CREATE, node));
    }

    deleteBattleNode(nodeID){
        let node = this.battleNodes[nodeID];
        if(node){
            // no emit because battle-end listener in server sends the battle-node-delete
            delete this.battleNodes[nodeID];
            node.destroy();
            node = null;
        }
    }

    // travel portal
    createPortalNode(gridX, gridY, instanceID, instanceName, text){
        let portal = new PortalNode(gridX, gridY, instanceID, instanceName, text);
        this.portalNodes[portal.portalID] = portal;
        this.emit(new GameEvent(GameEvent.PORTAL_NODE_CREATE, portal));
    }

    deletePortalNode(portalID){
        let portal = this.portalNodes[portalID];
        if(portal){
            delete this.portalNodes[portalID];
            portal = null;
            this.emit(new GameEvent(GameEvent.PORTAL_NODE_DELETE, portal));
        }
    }

    // add a socket
    addSocket(socket){
        if(socket.socketID in this.sockets === false){
            this.sockets[socket.socketID] = socket;
            socket.room = this;

            this.emit(new GameEvent(GameEvent.ROOM_ADD_SOCKET, socket));
        }
    }

    // remove a socket 
    removeSocket(socket){
        if(socket.socketID in this.sockets){
            delete this.sockets[socket.socketID];
            socket.room = null;

            if(socket.player && socket.player.battleNode){
                socket.player.battleNode.removeObject(socket.player);
            }

            this.emit(new GameEvent(GameEvent.ROOM_REMOVE_SOCKET, socket));
        }
    }

    // adds an object
    addObject(object){
        // objectIDs are unique to each room & objects are not bound to a room
        // so, -1 represents that an object has no room (removeObject will cause this)
        if(object.objectID === -1){
            // stamp ID and store object
            object.objectID = ++this.lastObjectID;
            this.objects[object.objectID] = object;

            // players always start at starting location
            if(object.type === "player"){
                object.x = this.startLocation.x;
                object.y = this.startLocation.y;
            }

            // emit (server is listening)
            this.emit(new GameEvent(GameEvent.ROOM_ADD_OBJECT, object));
        }
    }

    // removes an object (expects objectID but oveloaded to take object ref itself)
    removeObject(id){
        let object = null;
        if(typeof id === "number"){
            object = this.getObject(id);
        }
        else if(id instanceof Object){
            object = id;
        }

        if(object){
            delete this.objects[object.objectID];

            this.emit(new GameEvent(GameEvent.ROOM_REMOVE_OBJECT, object));
            object.objectID = -1;
        }
    }

    // updates an object
    updateObject(data){
        let object = this.getObject(data.objectID || -1);
        if(object){
            object.applyUpdate(data);

            this.emit(new GameEvent(GameEvent.ROOM_UPDATE_OBJECT, object));
        }
    }

    // applies a lambda function to each socket
    // signtare is... (socket:net.Socket, socketID:Int)
    forEachSocket(fn){
        for(let id in this.sockets){
            fn(this.sockets[id], id);
        }
    }

    // applies a lambda function to each game object
    // signtare is... (object:GameCombatObject, objectID:Int)
    forEachObject(fn){
        for(let id in this.objects){
            fn(this.objects[id], id);
        }
    }

    // applies a lambda function to each battle node
    // signtare is... (node:BattleNode, nodeID:Int)
    forEachBattleNode(fn){
        for(let id in this.battleNodes){
            fn(this.battleNodes[id], id);
        }
    }

    // applies a lambda function to each portal node
    // signature is... (node:BattleNode, portalID:Int)
    forEachPortalNode(fn){
        for(let id in this.portalNodes){
            fn(this.portalNodes[id], id);
        }
    }

    // destroys all things neccessary for terminating a room
    kill(){
        for(let k in this.objects){
            let obj = this.objects[k];
            if(obj.type !== "player"){
                obj.removeListeners();
                obj = null;
            }
            delete this.objects[k];
        }
    }

    // gets an object by objectID
    getObject(id){
        return this.objects[id] || null;
    }

    // gets a player object by name 
    getPlayer(name){
        this.forEachObject(obj => {
            if(obj.type === "player" && obj.name === name){
                return obj;
            }
        });
        return null;
    }

    // get a battle node by nodeID
    getBattleNode(nodeID){
        return this.battleNodes[nodeID] || null;
    }

    // counts the number of sockets 
    get numSockets(){
        let num = 0;
        for(let k in this.sockets){
            num++;
        }
        return num;
    }

    // counts the number of objects
    get numObjects(){
        let num = 0;
        for(let k in this.objects){
            num++
        }
        return num;
    }

    // counts the number of battle nodes
    get numBattleNodes(){
        let num = 0;
        for(let k in this.battleNodes){
            num++;
        }
        return num;
    }

    toString(){
        return `Room-${this.roomID} '${this.roomName}'`;
    }
};
Room.NPC_RESPAWN_DELAY = 2 * 60 * 1000;

module.exports = Room;