import UIController from './UIController';
import GameController from './GameController';
import AssetPreloader from './AssetPreloader';
import { OPC, Status } from './Comm';
import dark from '../lib/dark';

let net = window.require("net"),
    dgram = window.require("dgram");

const MSG_DELIM = "?&?";

let Client = class Client{
    constructor(){
        this.conn = null;
        this.socket = null;
        this.socketID = -1;

        this.game = null;

        this.VERSION = "0.1.0";

        AssetPreloader.preloadAssets();
    }

    connect(){
        console.log("Connecting....");
        UIController.showLoading("Connecting to server...");
        
        this.conn = net.createConnection(6615, () => {
            console.log("Connected!");
            UIController.showLogin();
        });

        this.conn.on("error", err => {
            UIController.showLoading("Connection error.");
        });

        this.conn.on("data", this.recieveData.bind(this));
    }

    recieveData(message){
        let split = message.toString().split(MSG_DELIM);

        for(let msg of split){
            let opc, data, status;
            
            try{
                let json = JSON.parse(msg);
                console.log(json);

                opc = json.opc || -1;
                data = json.data || {};
                status = json.status || Status.GOOD;
            }
            catch(err){
                continue;
            }

            this.processServerData(opc, data, status);
        }
    }

    processServerData(opc, data, status){
        if(opc === OPC.LOGIN){
            this.handleLogin(data, status);
        }
        else if(opc === OPC.LOGOUT){
            this.handleLogout(data, status);
        }
        else if(opc === OPC.CHARACTER_LIST){
            this.handleCharacterList(data, status);
        }
        else if(opc === OPC.CHARACTER_DELETE){
            this.handleCharacterDelete(data, status);
        }
        else if(opc === OPC.CHARACTER_CREATE){
            this.handleCharacterCreate(data, status);
        }
        else if(opc === OPC.CHARACTER_SELECT){
            this.handleCharacterSelect(data, status);
        }
        else if(opc === OPC.ROOM_CHANGE){
            this.handleRoomChange(data, status);
        }
        else if(opc === OPC.CHAT_MESSAGE){
            this.handleChat(data);
        }
        else if(opc === OPC.OBJECT_CREATE){
            GameController.createObject(data);
        }
        else if(opc === OPC.OBJECT_DELETE){
            GameController.deleteObject(data.objectID || -1);
        }
    }

    handleLogin(data, status){
        if(status === Status.GOOD){
            UIController.showCharacterSelect();
            this.socketID = data.socketID || -1;
            console.log(`I'm client #${this.socketID}.`);
        }
        else if(data.message){
            UIController.modal(data.message);
        }
    }

    handleLogout(data, status){
        if(status === Status.GOOD){
            this.socketID = -1;
        }
        else{
            UIController.modal(data.message);
        }
    }

    handleCharacterList(data, status){
        if(status === Status.GOOD){
            UIController.displayCharacterList(data);
        }
        else if(data.message){
            UIController.modal(data.message);
        }
    }

    handleCharacterDelete(data, status){
        UIController.modal(data.message);
    }

    handleCharacterCreate(data, status){
        if(status === Status.GOOD){
            UIController.showCharacterSelect();
        }
        else{
            UIController.modal(data.message);
        }
    }

    handleCharacterSelect(data, status){
        if(status !== Status.GOOD){
            UIController.modal(data.message);
        }
    }

    handleRoomChange(data, status){
        if(status === Status.GOOD){
            UIController.showGame();
        
            if(data.op === "join"){
                GameController.loadMap(data.roomName);
            }
            else if(data.op === "leave"){
                GameController.unloadMap();
            }
        }
    }

    handleChat(data){
        let message = (typeof data.sender === "string") ? (`${data.sender}: ${data.chat}`) : data.chat;
        UIController.hudChat(message);
    }

    send(opc, data){
        let message = {
            opc: opc,
            data: data
        };

        this.conn.write(JSON.stringify(message) + MSG_DELIM);
    }
};

export default new Client();
