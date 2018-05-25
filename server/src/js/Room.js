let EventEmitter = require("./EventEmitter"),
    GameEvent = require("./GameEvent");

let Room = class Room extends EventEmitter{
    constructor(roomID, roomName){
        super();

        this.roomID = roomID;
        this.roomName = roomName;

        this.sockets = {};
        this.objects = {};
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

            this.emit(new GameEvent(GameEvent.ROOM_ADD_OBJECT, object));
        }
    }

    removeObjectByID(id){
        let object = this.objects[id];
        if(object){
            delete this.objects[id];
            object.objectID = -1;

            this.emit(new GameEvent(GameEvent.ROOM_DELETE_OBJECT, object));
        }
    }

    updateObject(data){
        let object = (data.objectID || -1);
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
};

module.exports = Room;