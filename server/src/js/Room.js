let EventEmitter = require("./EventEmitter"),
    GameEvent = require("./GameEvent");

let Room = class Room extends EventEmitter{
    constructor(roomID, roomName, minLevel=1, startLocX=0, startLocY=0){
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

        this.lastObjectID = 0;
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
        let object = (typeof id === "number") ? this.objects[id] : object;
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
            fn(this.sockets[id]);
        }
    }

    forEachObject(fn){
        for(let id in this.objects){
            fn(this.objects[id]);
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