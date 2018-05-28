"use strict";
let net = require("net"),
    dgram = require("dgram"),
    mysql = require("mysql");

let DatabaseInquisitor = require("./js/DatabaseInquisitor"),
    GameEvent = require("./js/GameEvent"),
    Player = require("./js/Player"),
    PlayerSkins = require("./js/PlayerSkins"),
    Room = require("./js/Room"),
    Settings = require("./js/Settings"),
    UDPMessage = require("./js/UDPMessage");

const VERSION = "0.1.0",
    CLIENT_VERSION = "0.1.0",
    MSG_DELIM = "?&?",
    DEFAULT_ROOM = "main";

const TEAM_ID_PLAYERS = 1,
    TEAM_ID_ENEMIES = 2,
    TEAM_ID_NEUTRALS = 3;

const STATUS_GOOD = 2,
    STATUS_BAD = 4,
    STATUS_ERR = 5;

const OPC_AUTH = 1,
    OPC_LOGIN = 2,
    OPC_LOGOUT = 3,
    OPC_CHARACTER_LIST = 4,
    OPC_CHARACTER_SELECT = 5,
    OPC_CHARACTER_CREATE = 6,
    OPC_CHARACTER_DELETE = 7,
    OPC_ROOM_CHANGE = 8,
    OPC_ROOM_STATS = 9,
    OPC_CHAT_MESSAGE = 10,
    OPC_OBJECT_CREATE = 11,
    OPC_OBJECT_DELETE = 12,
    OPC_OBJECT_UPDATE = 13,
    OPC_OBJECT_STATS =  14,
    OPC_FX_SPAWN = 15,
    BATTLE_NODE_CREATE = 16,
    BATTLE_NODE_DELETE = 17,
    BATTLE_NODE_UPDATE = 18,
    BATTLE_ENTER = 19,
    BATTLE_EXIT = 20,
    BATTLE_PLAYERS_TURN = 21,
    BATTLE_CPU_TURN = 22,
    BATTLE_SPELL_SELECT = 23,
    BATTLE_SPELL_CAST = 24;

let settings = null,
    database = null,
    sockets = {},
    accounts = {},
    rooms = null,
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
    if(opc === OPC_AUTH){
        processAuth(socket, data.version || "", data.udpPort || -1);
    }
    else if(opc === OPC_LOGIN){
        processSocketLogin(socket, data.username || "", data.password || "");
    }
    else if(opc === OPC_LOGOUT){
        processSocketLogout(socket);  
    }
    else if(opc === OPC_CHARACTER_LIST){
        processCharacterList(socket);
    }
    else if(opc === OPC_CHARACTER_SELECT){
        processCharacterSelect(socket, data.name || "");
    }
    else if(opc === OPC_CHARACTER_CREATE){
        processCharacterCreate(socket, data.name || "", data.skinID || 1);
    }
    else if(opc === OPC_CHARACTER_DELETE){
        processCharacterDelete(socket, data.name || "");
    }
    else if(opc === OPC_ROOM_CHANGE){
        processRoomChange(socket, data.roomName);
    }
    else if(opc === OPC_CHAT_MESSAGE){
        processChat(socket, data.chat || "");
    }
    else if(opc === OPC_OBJECT_STATS){
        processObjectStats(socket, data.objectID || -1);
    }
};

let processAuth = function(socket, version, udpPort){
    if(version !== CLIENT_VERSION){
        send(socket, OPC_AUTH, "Wrong client version.", STATUS_BAD);
    }
    else{
        socket.udpPort = udpPort;
        send(socket, OPC_AUTH, {socketID: socket.socketID}, STATUS_GOOD);
    }
};

let processSocketLogin = function(socket, username, password){
    if(socket.username){
        send(socket, OPC_LOGIN, "You are logged in already.", STATUS_BAD);
        return;
    }

    if(username in accounts){
        send(socket, OPC_LOGIN, "Account already online.", STATUS_BAD);
        return;
    }

    database.retrieveAccountWithHash(username, (err, rows) => {
        if(err){
            console.log(err.message);
            send(socket, OPC_LOGIN, "Server error.", STATUS_ERR);
        }
        else if(rows.length < 1){
            send(socket, OPC_LOGIN, "Wrong username or password.", STATUS_BAD);
        }
        else{
            let account = rows[0],
                passHash = database.hash(password, account.salt);

            if(account.username !== username || passHash !== account.password){
                send(socket, OPC_LOGIN, "Wrong username or password.", STATUS_BAD);
            }
            else{
                socket.username = username;
                socket.accessLevel = account.access_level;

                accounts[username] = socket;

                send(socket, OPC_LOGIN, "Successful login", STATUS_GOOD);
            }
        }
    });
};

let processSocketLogout = function(socket){
    if(socket.username){
        delete accounts[socket.username]; 
        socket.username = null;

        send(socket, OPC_LOGOUT, "You have logged out.", STATUS_GOOD);
    }
    else{
        send(socket, OPC_LOGOUT, "You are not logged in.", STATUS_BAD);
    }
};

let processCharacterList = function(socket){
    if(!socket.username){
        send(socket, OPC_CHARACTER_LIST, "You are not logged in.", STATUS_BAD);
    }

    database.retrieveCharacterList(socket.username, (err, rows) => {
        if(err){
            console.log(err.message);
            send(socket, OPC_CHARACTER_LIST, "Server error.", STATUS_ERR);
        }
        else{
            send(socket, OPC_CHARACTER_LIST, rows, STATUS_GOOD);
        }
    });
};

let processCharacterCreate = function(socket, name, skinID=1){
    if(!socket.username){
        send(socket, OPC_CHARACTER_CREATE, "You are not logged in.", STATUS_BAD);
        return;
    }

    database.createCharacter(socket.username, name, skinID, err => {
        if(err){
            send(socket, OPC_CHARACTER_CREATE, err.message, STATUS_BAD);
        }
        else{
            send(socket, OPC_CHARACTER_CREATE, `Character "${name}" created.`, STATUS_GOOD);
        }
    });
};

let processCharacterDelete = function(socket, name){
    if(!socket.username){
        send(socket, OPC_CHARACTER_DELETE, "You are not logged in.", STATUS_BAD);
        return;
    }

    database.deleteCharacter(socket.username, name, err => {
        if(err){
            send(socket, OPC_CHARACTER_DELETE, err.message, STATUS_ERR);
        }
        else{
            send(socket, OPC_CHARACTER_DELETE, `"${name}" has been deleted.`, STATUS_GOOD);
            processCharacterList(socket);
        }
    });
};

let processCharacterSelect = function(socket, name){
    if(!socket.username){
        send(OPC_CHARACTER_SELECT, "You are not logged in.", STATUS_BAD);
        return;
    }

    database.retrieveCharacter(socket.username, name, (err, rows) => {
        if(err){
            console.log(err.message);
            send(OPC_CHARACTER_SELECT, "Server error.", STATUS_ERR);
        }
        else if(rows.length < 1){
            send(OPC_CHARACTER_SELECT, "Unable to load character.", STATUS_BAD);
        }
        else{
            createPlayer(socket, rows[0]);
            rooms[DEFAULT_ROOM].addSocket(socket);
        }
    });
};

let processRoomChange = function(socket, roomName){
    let room = rooms[roomName] || rooms[DEFAULT_ROOM];

    if(socket.room){
        socket.room.removeSocket(socket);
    }

    room.addSocket(socket);
};

let processChat = function(socket, chat){
    if(socket.room){
        if(chat.charAt(0) === "~"){
            processAdminCommand(socket, chat.substr(1));
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
            send(socket, OPC_OBJECT_STATS, object.getStats(), STATUS_GOOD);
        }
        else{
            send(socket, OPC_OBJECT_STATS, "Object not found.", STATUS_BAD);
        }
    }
    else{
        send(socket, OPC_OBJECT_STATS, "You are not in a room.", STATUS_BAD);
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
            sendChat(socket, `Cannot ADD '${attr}'`);
        }
    }
    else if(command === "set"){
        let attr = values[0] || null,
            val = parseInt(values[1]) || null;

        if(!attr || !val){
            sendChat(socket, "Expected... set <property> <value>");
            return;
        }

        sendChat(socket, `Cannot SET '${values[1]}'.`);
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
        sendChat(socket, `${command} is an invalid command.`);
    }
};

let sendChat = function(socket, chat, sender=null){
    send(socket, OPC_CHAT_MESSAGE, {chat: chat, sender: sender});
};

let sendRoomChat = function(room, chat, sender=null){
    sendRoom(room, OPC_CHAT_MESSAGE, {chat: chat, sender: sender});
};

let sendRoom = function(room, opc, data, status=STATUS_GOOD){
    let jsonMsg = createJSONMessage(opc, data, status);

    room.forEachSocket(sock => {
        sock.write(jsonMsg + MSG_DELIM)
    });
};

let send = function(socket, opc, data, status=STATUS_GOOD){
    socket.write(createJSONMessage(opc, data, status) + MSG_DELIM);
};

let createJSONMessage = function(opc, data, status=STATUS_GOOD){
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

    send(target, OPC_ROOM_CHANGE, {roomName: room.roomName, roomID: room.roomID, op: "join"});

    room.forEachObject(object => {
        send(target, OPC_OBJECT_CREATE, object.getSpawnData());
    });

    room.addObject(target.player);

    sendRoomChat(room, `${target.player.name} connected.`);
};

let handleRoomRemoveSocket = function(evt){
    let room = evt.emitter,
        target = evt.target;

    send(target, OPC_ROOM_CHANGE, {roomName: room.roomName, roomID: room.roomID, op: "leave"});

    room.removeObject(target.player.objectID);

    sendRoomChat(room, `${target.player.name} disconnected.`);
};

let handleRoomAddObject = function(evt){
    let room = evt.emitter,
        object = evt.target;

    room.forEachSocket(socket => {
        send(socket, OPC_OBJECT_CREATE, object.getSpawnData());
    });
};

let handleRoomRemoveObject = function(evt){
    let room = evt.emitter,
        object = evt.target;

    room.forEachSocket(socket => {
        send(socket, OPC_OBJECT_DELETE, {objectID: object.objectID});
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

let createRooms = function(){
    rooms = {
        "main": new Room(1, "main")
    };

    for(let room in rooms){
        rooms[room].on(GameEvent.ROOM_ADD_SOCKET, handleRoomAddSocket);
        rooms[room].on(GameEvent.ROOM_REMOVE_SOCKET, handleRoomRemoveSocket);
        rooms[room].on(GameEvent.ROOM_ADD_OBJECT, handleRoomAddObject);
        rooms[room].on(GameEvent.ROOM_REMOVE_OBJECT, handleRoomRemoveObject);
        rooms[room].on(GameEvent.ROOM_UPDATE_OBJECT, handleRoomUpdateObject);
    }
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
        if(numDone === 1){
            callback();
        }
    };

    let numDone = 0;

    database.loadSkins((err, rows) => {
        if(err){
            console.log(err.message);
            process.exit();
        }
        else{
            PlayerSkins.setSkins(rows);
            console.log(" - Player skins loaded.")
            
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

    createRooms();
};

console.log("  ______________________");
console.log(" /\t\t\t\\");
console.log("|     Hollow Crusade\t |");
console.log(`|   Game Server v${VERSION}\t |`);
console.log(" \\______________________/\n");
init();