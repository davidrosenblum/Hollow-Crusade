import UIController from './UIController';
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
            if(status === Status.GOOD){
                UIController.showCharacterSelect();
                this.socketID = data.socketID || -1;
            }
            else if(data.message){
                UIController.modal(data.message);
            }
        }

        else if(opc === OPC.LOGOUT){
            if(status === Status.GOOD){
                this.socketID = -1;
            }
            else{
                UIController.modal(data.message);
            }
        }

        else if(opc === OPC.CHARACTER_LIST){
            if(status === Status.GOOD){
                UIController.displayCharacterList(data);
            }
            else if(data.message){
                UIController.modal(data.message);
            }
        }

        else if(opc === OPC.CHARACTER_DELETE){
            UIController.modal(data.message);
        }
    }

    requestCharacterList(){
        this.send(OPC.CHARACTER_LIST);
    }

    requestCharacterDelete(name){
        this.send(OPC.CHARACTER_DELETE, {name: name});
    }

    requestCharacterSelect(name){
        console.log(name);
        //this.send(OPC.CHARACTER_SELECT, {name: name});
    }

    submitLogin(username, password){
        if(!username){
            UIController.modal("Please enter your username.");
            return;
        }

        if(!password){
            UIController.modal("Please enter your password.");
            return;
        }

        this.send(OPC.LOGIN, {username: username, password: password, version: this.VERSION});
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
