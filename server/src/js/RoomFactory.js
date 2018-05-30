let Room = require("./Room"),
    CombatObjects = require("./Comm").CombatObjects,
    Owners = require("./Comm").Owners,
    Teams = require("./Comm").Teams;

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

            RoomFactory.populateRoom(room);

            return room;
        }
        else throw new Error(`Room '${name}' does not exist.`);
    }

    static createInstance(name){
        let instance = RoomFactory.create(name);
        instance.roomID = ++RoomFactory.lastInstanceID;
        return instance;
    }

    static populateRoom(room){
        if(room.roomName === "Graveyard"){
            room.createBattleNode(96*5, 96*2,
                [
                    CombatObjects.SKELETON, CombatObjects.SKELETON, CombatObjects.ANIMUS, CombatObjects.SKELETON,
                    CombatObjects.SKELETON
                ]
            );
            room.createBattleNode(96*2, 96*4,
                [
                    CombatObjects.SKELETON, CombatObjects.SKELETON, CombatObjects.ANIMUS, CombatObjects.SKELETON,
                    CombatObjects.SKELETON_WARRIOR, CombatObjects.ANIMUS, CombatObjects.SKELETON
                ]
            );
            room.createBattleNode(96*7, 96*3,
                [
                    CombatObjects.SKELETON, CombatObjects.ANIMUS, CombatObjects.SKELETON_WARRIOR, CombatObjects.ABERRATION
                ]
            );
        } 
        else if(room.roomName === "Asylum"){
            room.createBattleNode(96*5, 96*2,
                [
                    CombatObjects.ANIMUS, CombatObjects.SKELETON_WARRIOR, CombatObjects.ANIMUS, CombatObjects.SKELETON_WARRIOR
                ]
            );
        }
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
RoomFactory.INSTANCE_ID_START = 99;
RoomFactory.lastInstanceID = RoomFactory.INSTANCE_ID_START;

module.exports = RoomFactory;