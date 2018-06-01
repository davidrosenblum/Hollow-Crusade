import UIController from './UIController';
import GameController from './GameController';
import AssetPreloader from './AssetPreloader';
import { OPC, Status } from './Comm';
import dark from '../lib/dark';
import UDPMessage from './UDPMessage';
import RequestSender from './RequestSender';

let net = window.require("net"),
    dgram = window.require("dgram");

const MSG_DELIM = "?&?"


let serverHost = "localhost",
    tcpPort = 6615,
    udpPort = 6617,
    tcpWait = {};

let Client = class Client{
    constructor(){
        this.config = {};
        this.parseCommandArgs();

        this.conn = null;
        this.socket = null;
        this.socketID = -1;
        this.socketUDP = null;

        this.VERSION = "0.1.0";

        AssetPreloader.preloadAssets();

        /* remove this later */
        window.gameClient = this;
    }

    bind(callback){
        this.socketUDP = dgram.createSocket("udp4", (msg, rinfo) => {
            let data = UDPMessage.parse(msg.toString());

            if(data.socketID !== this.socketID){
                GameController.updateObject(data);
            }
        });

        this.socketUDP.on("error", err => {
            console.log(err.message);
            UIController.showLoading("Unable to bind UDP socket.");
        });
        this.socketUDP.on("listening", evt => console.log(`UDP socket opened on port ${this.socketUDP.address().port}.`));

        this.socketUDP.bind(0, this.config.serverHost, callback);
    }

    sendUDP(message){
        this.socketUDP.send(message.toString(), this.config.udpPort, this.config.serverHost);
    }

    parseCommandArgs(){
        // process arguments are stored in the URL querystring
        let qs = window.location.href.split("?")[1] || "";
    
        let params = {};
        for(let arg of qs.split("&")){
            let split = arg.split("=")

            params[split[0]] = (split[1] || "true");
        }

        this.config.serverHost = params["server-host"] || "localhost";
        this.config.tcpPort = params["tcp-port"] || 6615;
        this.config.udpPort = params["udp-port"] || 6617;
        
        console.log(`Config=${JSON.stringify(this.config)}`);
    }

    connect(){
        this.parseCommandArgs();

        console.log("Connecting....");
        UIController.showLoading("Connecting to server...");
        
        this.conn = net.createConnection(this.config.tcpPort, this.config.serverHost, () => {
            console.log("Connected!");
            this.bind(() => {
                RequestSender.auth(this.socketUDP.address().port);
            });
        });

        this.conn.on("error", err => {
            UIController.showLoading("Connection error.", true);
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
        if(opc === OPC.AUTH){
            this.handleAuth(data, status);
        }
        else if(opc === OPC.LOGIN){
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
        else if(opc === OPC.OBJECT_UPDATE){
            GameController.updateObject(data);
        }
        else if(opc === OPC.OBJECT_STATS){
            this.handleObjectStats(data, status);
        }
        else if(opc === OPC.FX_SPAWN){
            // implement later
        }
        else if(opc === OPC.PLAYER_SKIN_CHANGE){
            this.handlePlayerSkinChange(data, status);
        }
        else if(opc === OPC.PORTAL_NODE_CREATE){
            this.handlePortalCreate(data, status);
        }
        else if(opc === OPC.PORTAL_NODE_DELETE){
            this.handlePortalDelete(data, status);
        }
        else if(opc === OPC.BATTLE_ENTER){
            this.handleBattleEnter(data, status);
        }
        else if(opc === OPC.BATTLE_EXIT){
            this.handleBattleExit(data, status);
        }
        else if(opc === OPC.BATTLE_NODE_CREATE){
            this.handleBattleCreate(data, status);
        }
        else if(opc === OPC.BATTLE_NODE_DELETE){
            this.handleBattleDelete(data, status);
        }
    }

    handleAuth(data, status){
        if(status === Status.GOOD){
            this.socketID = data.socketID || -1;
            console.log(`I'm client #${this.socketID}.`);
            UIController.showLogin();
        }
    }

    handleLogin(data, status){
        if(status === Status.GOOD){
            UIController.showCharacterSelect();
        }
        else if(data.message){
            UIController.modal(data.message);
        }
    }

    handleLogout(data, status){
        if(status === Status.GOOD){
            //this.socketID = -1;
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
        else if(data.message){
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

    handleObjectStats(data, status){
        if(status === Status.GOOD){
            if(GameController.targetObject && GameController.targetObject.objectID === data.objectID){
                UIController.hudTarget(data);
            }
            
            if(GameController.player && GameController.player.objectID === data.objectID){
                UIController.hudSelf(data);
            }
        }
    }

    handlePlayerSkinChange(data, status){
        if(status === Status.GOOD){
            GameController.updatePlayerSkin(data.objectID, data.skinID);
        }
        else if(data.message){
            UIController.hudChat(data.message);
        }
    }

    handlePortalCreate(data, status){
        if(status === Status.GOOD){
            GameController.createPortalNode(data);
        }
    }

    handlePortalDelete(data, status){
        if(status === Status.GOOD){
            GameController.deletePortalNode(data.portalID);
        }
    }

    handleBattleEnter(data, status){
        if(status === Status.GOOD){
            GameController.enterBattle();
        }
        else{
            GameController.exitBattle();
        }
    }

    handleBattleExit(data, status){
        if(status === Status.GOOD){
            GameController.exitBattle();
        }
    }

    handleBattleCreate(data, status){
        if(status === Status.GOOD){
            GameController.createBattleNode(data);
        }
    }

    handleBattleDelete(data, status){
        if(status === Status.GOOD){
            GameController.deleteBattleNode(data.nodeID);
        }
    }

    send(opc, data){
        if(opc in tcpWait){
            return;
        }

        let message = {
            opc: opc,
            data: data
        };

        this.conn.write(JSON.stringify(message) + MSG_DELIM);

        tcpWait[opc] = true;
        setTimeout(() => {
            delete tcpWait[opc];
        }, 500);
    }
};

export default new Client();
