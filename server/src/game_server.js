"use strict";
let net = require("net"),
    dgram = require("dgram"),
    mysql = require("mysql");

let DatabaseInquisitor = require("./js/DatabaseInquisitor"),
    GameEvent = require("./js/GameEvent"),
    NPCFactory = require("./js/NPCFactory"),
    OPC = require("./js/Comm").OPC,
    Player = require("./js/Player"),
    PlayerSkins = require("./js/PlayerSkins"),
    Room = require("./js/Room"),
    RoomFactory = require("./js/RoomFactory"),
    Settings = require("./js/Settings"),
    Status = require("./js/Comm").Status,
    UDPMessage = require("./js/UDPMessage");

const VERSION = "0.1.0",
    CLIENT_VERSION = "0.1.0",
    MSG_DELIM = "?&?",
    DEFAULT_MAP = 1;

const TEAM_ID_PLAYERS = 1,
    TEAM_ID_ENEMIES = 2,
    TEAM_ID_NEUTRALS = 3;

let settings = null,
    database = null,
    sockets = {},
    accounts = {},
    rooms = {},
    lastSocketID = 0;

net.Socket.prototype.toString = function(){
    return (this.socketID) ? `Client-${this.socketID}` : "[object net.Socket]";
};

let server = net.createServer(socket => {
    socket.socketID = ++lastSocketID;
    socket.room = null;
    socket.player = null;

    sockets[socket.socketID] = socket;

    socket.on("data", data => handleSocketData(socket, data));
    socket.on("error", err => {});
    socket.on("close", evt => closeSocket(socket));

    console.log(`${socket} connected.`);
});
server.on("listening", evt => console.log(`TCP server opened on port ${server.address().port}.`));

let socket = dgram.createSocket("udp4", (msg, rinfo) => {
    let data = UDPMessage.parse(msg.toString());

    let socket = sockets[data.socketID];

    if(socket && socket.room){
        socket.room.updateObject(data);
    }
});
socket.on("listening", evt => console.log(`UDP socket opened on port ${socket.address().port}.\n`));


let closeSocket = function(socket){
    console.log(`${socket} disconnected.`);

    if(socket.username){
        delete accounts[socket.username];
    }

    if(socket.room){
        socket.room.removeSocket(socket);
    }
};

let handleSocketData = function(socket, message){
    let split = message.toString().split(MSG_DELIM);

    for(let msg of split){
        let opc, data;

        try{
            let json = JSON.parse(msg);
            console.log(json);
            
            opc = json.opc || -1;
            data = json.data || {};
        }
        catch(err){
            continue;
        }

        processSocketData(socket, opc, data);
    }
};

let processSocketData = function(socket, opc, data){
    if(opc === OPC.AUTH){
        processAuth(socket, data.version || "", data.udpPort || -1);
    }
    else if(opc === OPC.LOGIN){
        processSocketLogin(socket, data.username || "", data.password || "");
    }
    else if(opc === OPC.LOGOUT){
        processSocketLogout(socket);  
    }
    else if(opc === OPC.CHARACTER_LIST){
        processCharacterList(socket);
    }
    else if(opc === OPC.CHARACTER_SELECT){
        processCharacterSelect(socket, data.name || "");
    }
    else if(opc === OPC.CHARACTER_CREATE){
        processCharacterCreate(socket, data.name || "", data.skinID || 1);
    }
    else if(opc === OPC.CHARACTER_DELETE){
        processCharacterDelete(socket, data.name || "");
    }
    else if(opc === OPC.ROOM_CHANGE){
        processRoomChange(socket, data.roomName);
    }
    else if(opc === OPC.CHAT_MESSAGE){
        processChat(socket, data.chat || "");
    }
    else if(opc === OPC.OBJECT_STATS){
        processObjectStats(socket, data.objectID || -1);
    }
    else if(opc === OPC.PLAYER_SKIN_CHANGE){
        processPlayerSkinChange(socket, data.skinID || -1);
    }
    else if(opc === OPC.INSTANCE_ENTER){
        // use room change for exit
        processInstanceEnter(socket, data.instanceID || -1, data.instanceName || "");
    }
};

let processAuth = function(socket, version, udpPort){
    if(version !== CLIENT_VERSION){
        send(socket, OPC.AUTH, "Wrong client version.", Status.BAD);
    }
    else{
        socket.udpPort = udpPort;
        send(socket, OPC.AUTH, {socketID: socket.socketID}, Status.GOOD);
    }
};

let processSocketLogin = function(socket, username, password){
    if(socket.username){
        send(socket, OPC.LOGIN, "You are logged in already.", Status.BAD);
        return;
    }

    if(username in accounts){
        send(socket, OPC.LOGIN, "Account already online.", Status.BAD);
        return;
    }

    database.retrieveAccountWithHash(username, (err, rows) => {
        if(err){
            console.log(err.message);
            send(socket, OPC.LOGIN, "Server error.", Status.ERR);
        }
        else if(rows.length < 1){
            send(socket, OPC.LOGIN, "Wrong username or password.", Status.BAD);
        }
        else{
            let account = rows[0],
                passHash = database.hash(password, account.salt);

            if(account.username !== username || passHash !== account.password){
                send(socket, OPC.LOGIN, "Wrong username or password.", Status.BAD);
            }
            else{
                socket.username = username;
                socket.accessLevel = account.access_level;

                accounts[username] = socket;

                send(socket, OPC.LOGIN, "Successful login", Status.GOOD);
            }
        }
    });
};

let processSocketLogout = function(socket){
    if(socket.username){
        delete accounts[socket.username]; 
        socket.username = null;

        send(socket, OPC.LOGOUT, "You have logged out.", Status.GOOD);
    }
    else{
        send(socket, OPC.LOGOUT, "You are not logged in.", Status.BAD);
    }
};

let processCharacterList = function(socket){
    if(!socket.username){
        send(socket, OPC.CHARACTER_LIST, "You are not logged in.", Status.BAD);
    }

    database.retrieveCharacterList(socket.username, (err, rows) => {
        if(err){
            console.log(err.message);
            send(socket, OPC.CHARACTER_LIST, "Server error.", Status.ERR);
        }
        else{
            send(socket, OPC.CHARACTER_LIST, rows, Status.GOOD);
        }
    });
};

let processCharacterCreate = function(socket, name, skinID=1){
    if(!socket.username){
        send(socket, OPC.CHARACTER_CREATE, "You are not logged in.", Status.BAD);
        return;
    }

    database.createCharacter(socket.username, name, skinID, err => {
        if(err){
            send(socket, OPC.CHARACTER_CREATE, err.message, Status.BAD);
        }
        else{
            send(socket, OPC.CHARACTER_CREATE, `Character "${name}" created.`, Status.GOOD);
        }
    });
};

let processCharacterDelete = function(socket, name){
    if(!socket.username){
        send(socket, OPC.CHARACTER_DELETE, "You are not logged in.", Status.BAD);
        return;
    }

    database.deleteCharacter(socket.username, name, err => {
        if(err){
            send(socket, OPC.CHARACTER_DELETE, err.message, Status.ERR);
        }
        else{
            send(socket, OPC.CHARACTER_DELETE, `"${name}" has been deleted.`, Status.GOOD);
            processCharacterList(socket);
        }
    });
};

let processCharacterSelect = function(socket, name){
    if(!socket.username){
        send(OPC.CHARACTER_SELECT, "You are not logged in.", Status.BAD);
        return;
    }

    database.retrieveCharacter(socket.username, name, (err, rows) => {
        if(err){
            console.log(err.message);
            send(OPC.CHARACTER_SELECT, "Server error.", Status.ERR);
        }
        else if(rows.length < 1){
            send(OPC.CHARACTER_SELECT, "Unable to load character.", Status.BAD);
        }
        else{
            createPlayer(socket, rows[0]);
            processRoomChange(socket, socket.player.lastMapID);
        }
    });
};

let processRoomChange = function(socket, roomID){
    let nextRoom = rooms[roomID] || rooms[DEFAULT_MAP];

    if(socket.room){
        let currRoom = socket.room;
        currRoom.removeSocket(socket);

        // leaving an instance?
        if(currRoom.roomID >= RoomFactory.INSTANCE_ID_START){
            // instance now empty?
            if(currRoom.numSockets === 0){
                console.log(`${currRoom} deleted.`);
                currRoom.kill();
                delete rooms[currRoom.roomID];
                currRoom = null;   
            }
            else console.log(`${currRoom} still has members`);
        }
    }

    nextRoom.addSocket(socket);
};

let processChat = function(socket, chat){
    if(socket.room){
        if(chat.charAt(0) === "~"){
            processAdminCommand(socket, chat.substr(1));
        }
        else if(chat.charAt(0) === "/"){
            processCommand(socket, chat.substr(1));
        }
        else{
            sendRoomChat(socket.room, chat, socket.player.name);
        }
    }
};

let processObjectStats = function(socket, objectID){
    if(socket.room){
        let object = socket.room.getObject(objectID);
        
        if(object){
            send(socket, OPC.OBJECT_STATS, object.getStats(), Status.GOOD);
        }
        else{
            send(socket, OPC.OBJECT_STATS, "Object not found.", Status.BAD);
        }
    }
    else{
        send(socket, OPC.OBJECT_STATS, "You are not in a room.", Status.BAD);
    }
};

let processPlayerSkinChange = function(socket, skinID){
    if(socket.room && socket.player){
        try{
            socket.player.applySkin(skinID);
        }
        catch(err){
            send(socket, OPC.PLAYER_SKIN_CHANGE, err.message, Status.BAD);
            return;
        }

        //sendChat(socket, OPC.PLAYER_SKIN_CHANGE, `Changed to skin ${PlayerSkins.getSkin(skinID).name}.`, Status.GOOD);

        processObjectStats(socket, socket.player.objectID);

        let data = {
            objectID: socket.player.objectID,
            skinID: socket.player.skinID
        };
        sendRoom(socket.room, OPC.PLAYER_SKIN_CHANGE, data, Status.GOOD);
    }
    else{
        send(socket, OPC.PLAYER_SKIN_CHANGE, "You are not in a room.", Status.BAD);
    }
};

let processInstanceEnter = function(socket, id=0, name=""){
    let instance = null;
    if(id >= RoomFactory.INSTANCE_ID_START){
        instance = rooms[id] || null;
    }
    else if(typeof name === "string"){
        try{
            instance = createInstanceRoom(name);
            console.log(`${instance} created.`);
        }
        catch(err){
            send(socket, OPC.INSTANCE_ENTER, `Unable to create instance '${name}'.`, Status.BAD);
            return;
        }
    }

    if(instance){
        processRoomChange(socket, instance.roomID);
        return true;
    }

    send(socket, OPC.INSTANCE_ENTER, `Unable to find instance ${id}.`, Status.BAD);
    return false;
};

let processCommand = function(socket, chat){
    let values = chat.split(" "),
        command = values.shift();

        console.log(chat);

    if(command === "get"){
        let attr = values[0] || "";

        if(!attr){
            sendChat(socket, "Expected get <property>");
            return;
        }

        if(attr === "map"){
            let room = socket.room;
            sendChat(socket, `Map = (${room.roomID}) "${room.roomName}"`);
        }
        else if(attr === "name"){
            sendChat(socket, `Name = "${socket.player.name}"`);
        }
        else if(attr === "level"){
            sendChat(socket, `Level = ${socket.player.level}`);
        }
        else{
            sendChat(socket, `Cannot get '${attr}'.`);
        }
    }
    else{
        sendChat(socket, `'${command}' is an invalid command.`);
    }
};

let processAdminCommand = function(socket, chat){
    if(socket.accessLevel < 2){
        sendChat(socket, "You do not have admin command privilege.");
        return;
    }

    let values = chat.split(" "),
        command = values.shift();

    if(command === "add"){
        let attr = values[0] || "",
            val = parseInt(values[1]) || "";

        if(!attr || !val){
            sendChat(socket, "Expected... add <property> <value>");
            return;
        }

        if(val <= 0){
            sendChat(socket, "Value must be greater than zero.");
            return;
        }

        if(attr === "health"){
            socket.player.addHealth(val|| 0);
        }
        else if(attr === "mana"){
            socket.player.addMana(val || 0);
        }
        else if(attr === "xp"){
            socket.player.addXP(val || 0);
        }
        else if(attr === "money"){
            socket.player.addMoney(val || 0);
        }
        else if(attr === "tokens"){
            socket.player.addTokens(val || 0);
        }
        else{
            sendChat(socket, `Cannot add '${attr}'`);
        }
    }
    else if(command === "set"){
        let attr = values[0] || null,
            val = parseInt(values[1]) || null;

        if(!attr || !val){
            sendChat(socket, "Expected... set <property> <value>");
            return;
        }

        if(attr === "skin"){
            processPlayerSkinChange(socket, val);
        }
        else if(attr === "map"){
            if(val !== socket.room.roomID){
                processRoomChange(socket, val);
            }
            else{
                sendChat(socket, "You are already in that map.");
            }
        }
        else{
            sendChat(socket, `Cannot set '${attr}'.`);
        }
    }
    else if(command === "instance"){
        let attr = values[0] || null;
        
        if(!attr){
            sendChat(socket, "Expected... instance <name>");
            return;
        }

        if(!processInstanceEnter(socket, -1, attr)){
            sendChat(socket, `Unable to create instance '${attr}'.`);
        }
    }
    else if(command === "kill"){
        room.deleteObject(values[0] || 0);
    }
    else if(command === "kick"){
        kickPlayer(room, values[0] || "");
    }
    else if(command === "broadcast"){
        broadcastChat(values[0]);
    }
    else{
        sendChat(socket, `'${command}' is an invalid command.`);
    }
};

let sendChat = function(socket, chat, sender=null){
    send(socket, OPC.CHAT_MESSAGE, {chat: chat, sender: sender});
};

let sendRoomChat = function(room, chat, sender=null){
    sendRoom(room, OPC.CHAT_MESSAGE, {chat: chat, sender: sender});
};

let sendRoom = function(room, opc, data, status=Status.GOOD){
    let jsonMsg = createJSONMessage(opc, data, status);

    room.forEachSocket(sock => {
        sock.write(jsonMsg + MSG_DELIM)
    });
};

let send = function(socket, opc, data, status=Status.GOOD){
    socket.write(createJSONMessage(opc, data, status) + MSG_DELIM);
};

let createJSONMessage = function(opc, data, status=Status.GOOD){
    let message = {
        opc: opc,
        data: (typeof data === "string") ? {message: data} : data,
        status: status
    };
    return JSON.stringify(message);
}

let broadcastChat = function(chat){
    for(let k in rooms){
        sendRoomChat(rooms[k], chat, "[SERVER]");
    }
};

let kickPlayer = function(room, name){
    let target = room.getPlayer(name);
    if(target){
        room.removeSocket(sockets[target.ownerID]);
    }
};

let handleRoomAddSocket = function(evt){
    let room = evt.emitter,
        target = evt.target;

    send(target, OPC.ROOM_CHANGE, {roomName: room.roomName, roomID: room.roomID, op: "join"});

    room.forEachObject(object => {
        send(target, OPC.OBJECT_CREATE, object.getSpawnData());
    });

    room.addObject(target.player);

    sendRoomChat(room, `${target.player.name} connected.`);

    if(room.roomID < RoomFactory.INSTANCE_ID_START){
        target.player.lastMapID = room.roomID;
        database.updateCharacter({name: target.player.name, map_id: room.roomID});
    }
};

let handleRoomRemoveSocket = function(evt){
    let room = evt.emitter,
        target = evt.target;

    send(target, OPC.ROOM_CHANGE, {roomName: room.roomName, roomID: room.roomID, op: "leave"});

    room.removeObject(target.player.objectID);

    sendRoomChat(room, `${target.player.name} disconnected.`);
};

let handleRoomAddObject = function(evt){
    let room = evt.emitter,
        object = evt.target;

    room.forEachSocket(socket => {
        send(socket, OPC.OBJECT_CREATE, object.getSpawnData());
    });
};

let handleRoomRemoveObject = function(evt){
    let room = evt.emitter,
        object = evt.target;

    room.forEachSocket(socket => {
        send(socket, OPC.OBJECT_DELETE, {objectID: object.objectID});
    });
};

let handleRoomUpdateObject = function(evt){
    let room = evt.emitter,
        object = evt.target;

    // UDP update...
    let message = new UDPMessage(object.ownerID, object.objectID, object.x, object.y, object.anim).toString();
    
    // dumb var naming, sock = current client socket (TCP) and socket = UDP socket
    room.forEachSocket(sock => {
        if(sock.socketID !== object.ownerID){
            socket.send(message, sock.udpPort);
        }
    });
};

let createPlayer = function(socket, saveData){
    socket.player = new Player(saveData);
    socket.player.teamID = TEAM_ID_PLAYERS;
    socket.player.ownerID = socket.socketID;

    socket.player.on(GameEvent.PLAYER_MONEY, evt => {
        sendChat(socket, `You gained ${evt.value} money.`);
        database.updateCharacter(socket.player.getSaveData());

        processObjectStats(socket, socket.player.objectID);
    });

    socket.player.on(GameEvent.PLAYER_TOKENS, evt => {
        sendChat(socket, `You gained ${evt.value} ${(evt.value < 2 ? "token" : "tokens")}.`);
        database.updateCharacter(socket.player.getSaveData());

        processObjectStats(socket, socket.player.objectID);
    });

    socket.player.on(GameEvent.PLAYER_XP, evt => {
        sendChat(socket, `You gained ${evt.value} XP.`);
        database.updateCharacter(socket.player.getSaveData());
        
        processObjectStats(socket, socket.player.objectID);
    });

    socket.player.on(GameEvent.PLAYER_LEVEL_UP, evt => {
        sendChat(socket, `You reached level ${evt.value}!`);

        database.updateCharacter(socket.player.getSaveData());

        socket.player.fillHealth();
        socket.player.fillMana();

        processObjectStats(socket, socket.player.objectID);
    });
};

let createMapRoom = function(name){
    let room = RoomFactory.create(name);

    room.on(GameEvent.ROOM_ADD_SOCKET, handleRoomAddSocket);
    room.on(GameEvent.ROOM_REMOVE_SOCKET, handleRoomRemoveSocket);
    room.on(GameEvent.ROOM_ADD_OBJECT, handleRoomAddObject);
    room.on(GameEvent.ROOM_REMOVE_OBJECT, handleRoomRemoveObject);
    room.on(GameEvent.ROOM_UPDATE_OBJECT, handleRoomUpdateObject);

    rooms[room.roomID] = room;

    return room;
};

let createInstanceRoom = function(name){
    let instance = RoomFactory.createInstance(name);
    
    instance.on(GameEvent.ROOM_ADD_SOCKET, handleRoomAddSocket);
    instance.on(GameEvent.ROOM_REMOVE_SOCKET, handleRoomRemoveSocket);
    instance.on(GameEvent.ROOM_ADD_OBJECT, handleRoomAddObject);
    instance.on(GameEvent.ROOM_REMOVE_OBJECT, handleRoomRemoveObject);
    instance.on(GameEvent.ROOM_UPDATE_OBJECT, handleRoomUpdateObject);

    rooms[instance.roomID] = instance;

    return instance;
};

let connectDB = function(callback){
    let dbConn = mysql.createConnection(settings.mysql || {});

    dbConn.connect(err => {
        if(!err){
            database = new DatabaseInquisitor(dbConn);
            callback();
        }
        else{
            callback(err);
        }
    });
};

let loadDatabaseTables = function(callback){
    let checkDone = function(){
        numDone++;
        if(numDone === 3){
            callback();
        }
    };

    let numDone = 0;

    database.loadMaps((err, rows) => {
        if(err){
            console.log(err.message);
            process.exit();
        }
        else{
            RoomFactory.setRoomData(rows);
            console.log(" - Maps loaded.");

            // create starting rooms
            createMapRoom("Titan's Landing");
            createMapRoom("Northern Keep");

            checkDone();
        }
    });

    database.loadNPCs((err, rows) => {
        if(err){
            console.log(err.message);
            process.exit();
        }
        else{
            NPCFactory.setNPCData(rows);
            console.log(" - NPCs loaded.");
            checkDone();
        }
    });

    database.loadSkins((err, rows) => {
        if(err){
            console.log(err.message);
            process.exit();
        }
        else{
            PlayerSkins.setSkins(rows);
            console.log(" - Skins loaded.");
            checkDone();   
        }
    });
};

let init = function(){
    console.log("Loading settings...");
    Settings.load((err, data) => {
        if(err){
            if(err.errno && err.errno === -4058){
                console.log("Writing and using default settings.");
                Settings.writeDefault();

                settings = new Settings();
            }
            else{
                console.log(err.message);
                process.exit();
            }
        }
        else{
            console.log("Settings loaded.");
            settings = new Settings(data);
        }

        console.log("\nConnecting to MySQL database...");
        connectDB(err => {
            if(err){
                console.log(err.message);
                process.exit();
            }
            else{
                console.log("MySQL database connected.\n");

                console.log("Loading database tables...")
                loadDatabaseTables(() => {
                    console.log("Database tables loaded.\n");

                    server.listen(settings.tcp_port, () => {
                        socket.bind(settings.udp_port);
                    });  
                });
            }
        });
    });
};

console.log("  ______________________");
console.log(" /\t\t\t\\");
console.log("|     Hollow Crusade\t |");
console.log(`|   Game Server v${VERSION}\t |`);
console.log(" \\______________________/\n");
init();