let Room = require("./Room");

/*
    NOTE:
    'Maps' are ROOMS that use the DB map_id (only 1 because unique keys)
        * server stores 'maps' in a dict by map_id
        * anyone can join a map because the map_id is known
    'Instances' are ROOMS that have a generated unique key (can have copies!)
        * server stores 'instances' by their generated keys
        * cant just join an instance because clients dont know the keys 
*/

let RoomFactory = class RoomFactory{
    static create(name){
        let roomData = RoomFactory.getRoomData(name);
        if(roomData){
            let room = new Room(
                roomData.roomID,
                roomData.roomName,
                roomData.minLevel,
                roomData.startX,
                roomData.startY
            );

            return room;
        }
        else throw new Error(`Room '${name}' does not exist.`);
    }

    static createInstance(name){
        let room = RoomFactory.create(name);
        room.roomID = ++RoomFactory.lastInstanceID;
        return room;
    }

    static setRoomData(rows){
        for(let row of rows){
            RoomFactory.roomData[row.name] = {
                roomID:     row.map_id,
                roomName:   row.name,
                minLevel:   row.min_level,
                startX:     row.start_x,
                startY:     row.start_y
            };
        }
    }

    static getRoomData(name){
        return RoomFactory.roomData[name] || null;
    }
};
RoomFactory.roomData = {}; // populated from database;
RoomFactory.lastInstanceID = 99;

module.exports = RoomFactory;