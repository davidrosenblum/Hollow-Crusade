/*
    RoomFactory
    creates rooms that can hold sockets, objects, and battle nodes while keeping everything in sync

    (David)

    NOTE:
    'Maps' are ROOMS that use the DB map_id (should be only 1 each because unique keys)
        * server stores 'maps' in the rooms dict by map_id
        * anyone can join a map because the map_id is known to the client
    'Instances' are ROOMS that have a generated unique key (multiples of the same map, )
        * server stores 'instances' by their generated keys (also in the rooms dict)
        * cant just join an instance because clients dont know the keys 
    Therefore,
        * All instances are maps, just with an unrecognizable key (essentially makes it a private map)
        * Client can expect standard maps with known keys 
        * rooms[db_map_id] = map, rooms[generated_instance_id] = instance
    How can there be no key collisions?,
        * instance_ids start at 100 (can be changed), so there can be 1-99 'maps'
    Is this smart or really dumb?,
        * not sure 
*/

// import modules
let Room = require("./Room"),
    CombatObjects = require("./Comm").CombatObjects,
    Owners = require("./Comm").Owners,
    Teams = require("./Comm").Teams;

let RoomFactory = class RoomFactory{
    static create(name){
        // creates a room using the default map_id (this would be considered a 'map')
        let roomData = RoomFactory.getRoomData(name);
        if(roomData){
            let room = new Room(
                roomData.roomID,
                roomData.roomName,
                roomData.minLevel,
                roomData.startX,
                roomData.startY
            );

            // attach battle nodes (include the enemies)
            RoomFactory.populateRoom(room);

            // attach travel portals
            RoomFactory.createPortals(room);

            return room;
        }
        else throw new Error(`Room '${name}' does not exist.`);
    }

    // creates an instance room by creating a rom and giving it a generated instance ID 
    static createInstance(name){
        let instance = RoomFactory.create(name);
        instance.roomID = ++RoomFactory.lastInstanceID;
        return instance;
    }

    // create battle nodes for the created room 
    static populateRoom(room){
        if(room.roomName === "Graveyard"){
            room.createBattleNode(96*4, 96*2,
                [
                    /*CombatObjects.SKELETON, CombatObjects.SKELETON, CombatObjects.ANIMUS, CombatObjects.SKELETON,*/
                    CombatObjects.SKELETON
                ]
            );
        } 
        else if(room.roomName === "Asylum"){
            room.createBattleNode(96*5, 96*22,
                [
                    CombatObjects.ANIMUS, CombatObjects.SKELETON_WARRIOR, CombatObjects.ANIMUS, CombatObjects.SKELETON_WARRIOR
                ]
            );
        }
    }

    // attaches portals to travel between zones 
    static createPortals(room){
        if(room.roomName === "Titan's Landing"){
            room.createPortalNode(10, 1, 2, null, "Northern Keep"); // to northern keep
            room.createPortalNode(12, 15, null, "Graveyard", "Graveyard Instance"); // to graveyard
        }
        else if(room.roomName === "Northern Keep"){
            room.createPortalNode(2, 4, 1, null, "Titan's Landing"); // to TL 
        }
        else if(room.roomName === "Graveyard"){
            room.createPortalNode(3, 1, 1, null, "Titan's Landing");
            room.createPortalNode(18, 4, 1, null, "Titan's Landing");
        }
    }

    // stores and formats the room data loaded from the database
    static setRoomData(rows){
        for(let row of rows){
            RoomFactory.roomData[row.name] = {
                roomID:     row.map_id,     // ID will be overrided for 'instances'
                roomName:   row.name,
                minLevel:   row.min_level,
                startX:     row.start_x,
                startY:     row.start_y
            };
        }
    }

    // gets the room data for the given room name
    static getRoomData(name){
        return RoomFactory.roomData[name] || null;
    }
};
RoomFactory.roomData = {}; // populated from database;
RoomFactory.INSTANCE_ID_START = 99;
RoomFactory.lastInstanceID = RoomFactory.INSTANCE_ID_START;

module.exports = RoomFactory;