import Client from './Client';
import { OPC } from './Comm';
import UDPMessage from './UDPMessage';

let RequestSender = class RequestSender{
    static auth(port){
        Client.send(OPC.AUTH, {version: Client.VERSION, udpPort: port});
    }

    static login(username, password){
        Client.send(OPC.LOGIN, {username: username, password: password})
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

    static objectUpdate(data){
        let message = new UDPMessage(Client.socketID, data.objectID, data.x, data.y, data.anim);
        Client.sendUDP(message);
    }

    static objectStats(id){
        Client.send(OPC.OBJECT_STATS, {objectID: id});
    }

    static battleEnter(id){
        Client.send(OPC.BATTLE_ENTER, {nodeID: id});
    }

    static battleExit(){
        Client.send(OPC.BATTLE_EXIT);
    }
};

export default RequestSender;