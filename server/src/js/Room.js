let EventEmitter = require("./EventEmitter"),
    GameEvent = require("./GameEvent"),
    BattleNode = require("./BattleNode"),
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

        this.sockets = {};
        this.objects = {};

        this.battleNodes = {};

        this.lastObjectID = 0;
    }

    createBattleNode(x, y, npcs, ownerID=Owner.ENEMIES, teamID=Teams.ENEMIES){
        let node = new BattleNode(x, y, ownerID, teamID, npcs);
        this.battleNodes[node.nodeID] = node;

        node.on(GameEvent.BATTLE_ADD_ENEMY, evt => this.addObject(evt.target));
        node.on(GameEvent.BATTLE_REMOVE_ENEMY, evt => this.removeObject(evt.target));

        node.on(GameEvent.BATTLE_ADD_PLAYER, evt => {
            this.emit(new GameEvent(GameEvent.BATTLE_ADD_PLAYER, evt.target));
        });

        node.on(GameEvent.BATTLE_REMOVE_PLAYER, evt => {
            this.emit(new GameEvent(GameEvent.BATTLE_REMOVE_PLAYER, evt.target));
        });
        
        node.on(GameEvent.BATTLE_END, evt => {
            this.emit(new GameEvent(GameEvent.BATTLE_END, node));
            delete this.battleNodes[node.nodeID];
        });

        this.emit(new GameEvent(GameEvent.BATTLE_CREATE, node));
    }

    addNPCs(array, teamID, respawnable=true){
        for(let npc of array){
            let originX = npc.x,
                originY = npc.y;
                
            npc.teamID = teamID;
        
            if(this.addObject(npc) && respawnable){
                npc.on(GameEvent.UNIT_DEATH, evt => {
                    setTimeout(() => {
                        // ... respawn ...
                    }, Room.NPC_RESPAWN_DELAY);
                });
            }
        }
    }

    addSocket(socket){
        if(socket.socketID in this.sockets === false){
            this.sockets[socket.socketID] = socket;
            socket.room = this;

            this.emit(new GameEvent(GameEvent.ROOM_ADD_SOCKET, socket));
        }
    }

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

    addObject(object){
        if(object.objectID === -1){
            object.objectID = ++this.lastObjectID;
            this.objects[object.objectID] = object;

            if(object.type === "player"){
                object.x = this.startLocation.x;
                object.y = this.startLocation.y;
            }

            this.emit(new GameEvent(GameEvent.ROOM_ADD_OBJECT, object));
        }
    }

    removeObject(id){
        let object = null;
        if(typeof id === "number"){
            object = this.getObject(id);
        }
        else if(id instanceof Object){
            object = id;
        }

        if(object){
            delete this.objects[id];

            this.emit(new GameEvent(GameEvent.ROOM_REMOVE_OBJECT, object));
            object.objectID = -1;
        }
    }

    updateObject(data){
        let object = this.getObject(data.objectID || -1);
        if(object){
            object.applyUpdate(data);

            this.emit(new GameEvent(GameEvent.ROOM_UPDATE_OBJECT, object));
        }
    }

    forEachSocket(fn){
        for(let id in this.sockets){
            fn(this.sockets[id], id);
        }
    }

    forEachObject(fn){
        for(let id in this.objects){
            fn(this.objects[id], id);
        }
    }

    forEachBattleNode(fn){
        for(let id in this.battleNodes){
            fn(this.battleNodes[id], id);
        }
    }

    getObject(id){
        return this.objects[id] || null;
    }

    getPlayer(name){
        this.forEachObject(obj => {
            if(obj.type === "player" && obj.name === name){
                return obj;
            }
        });
        return null;
    }

    getBattleNode(nodeID){
        return this.battleNodes[nodeID] || null;
    }

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

    get numSockets(){
        let num = 0;
        for(let k in this.sockets){
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