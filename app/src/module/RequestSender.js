import Client from './Client';
import { OPC } from './Comm';

let RequestSender = class RequestSender{
    static login(username, password){
        Client.send(OPC.LOGIN, {username: username, password: password, version: Client.VERSION})
    }

    static logout(){
        Client.send(OPC.LOGOUT);
    }

    static characterList(){
        Client.send(OPC.CHARACTER_LIST);
    }

    static selectCharacter(name){
        Client.send(OPC.CHARACTER_SELECT, {name: name});
    }

    static deleteCharacter(name){
        Client.send(OPC.CHARACTER_DELETE, {name: name});
    }

    static createCharacter(name, skinID){
        Client.send(OPC.CHARACTER_CREATE, {name: name, skinID: skinID});
    }

    static roomStats(id){
        Client.send(OPC.ROOM_STATS, {roomID: id});
    }

    static changeRooms(name, id){
        // id = join a specific room (useful for instances)
        // name = join a map (figures out the ID)
        Client.send(OPC.ROOM_CHANGE, {roomID: id, roomName: name});
    }

    static chat(chat){
        Client.send(OPC.CHAT_MESSAGE, {chat: chat});
    }

    static objectStats(id){
        Client.send(OPC.OBJECT_STATS, {objectID: id});
    }
};

export default RequestSender;