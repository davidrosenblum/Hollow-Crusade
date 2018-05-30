let EventEmitter = require("./EventEmitter"),
    GameEvent = require("./GameEvent"),
    NPCFactory = require("./NPCFactory");

let BattleNode = class BattleNode extends EventEmitter{
    // nodes can only have 4 at a time BUT can be constructed with more that go into reserve (designed for enemies)
    constructor(x, y, ownerID, teamID, objectTypes){
        super();

        this.nodeID = ++BattleNode.lastNodeID;

        this.x = x;
        this.y = y;

        this.players = new Array(BattleNode.MAX_OBJECTS);
        this.objects = new Array(BattleNode.MAX_OBJECTS);
        this.reserveObjects = [];

        for(let i = 0, obj; i < objectTypes.length; i++){
            obj = NPCFactory.create(objectTypes[i], this.x, this.y, ownerID, teamID);

            obj.on(GameEvent.UNIT_DEATH, this.onObjectDeath.bind(this));

            if(i < 4){
                setTimeout(() => this.addObject(obj), 1);
            }
            else{
                this.reserveObjects.push(obj);
            }
        }
    }

    findEmptyIndex(array){
        for(let i = 0; i < array.length; i++){
            if(array[i] === undefined || array[i] === null){
                return i;
            }
        }
        return -1;
    }

    addPlayer(player){
        if(this.numPlayers + 1 <= BattleNode.MAX_OBJECTS){
            let i = this.findEmptyIndex(this.players);
            this.players[i] = player;

            player.battleNode = this;
            player.x = this.x + (i * BattleNode.SPACE_BETWEEN_OBJECTS);
            player.y = this.y + BattleNode.SPACE_BETWEEN_OBJECTS;

            this.emit(new GameEvent(GameEvent.BATTLE_ADD_PLAYER, player));
        }
    }

    removePlayer(player){
        for(let i = 0; i < this.numPlayers; i++){
            if(this.players[i] === player){
                player.battleNode = null;
                this.players[i] = undefined;
                this.emit(new GameEvent(GameEvent.BATTLE_REMOVE_PLAYER, player));
                break;
            }
        }

        if(this.numPlayers === 0){
            this.emit(new GameEvent(GameEvent.BATTLE_PLAYERS_END));
        }
    }

    addObject(object){
        if(object.type === "player"){
            this.addPlayer(object);
        }
        else if(this.numObjects + 1 <= BattleNode.MAX_OBJECTS){
            let i = this.findEmptyIndex(this.objects);
            this.objects[i] = object;

            object.battleNode = this;
            object.x = this.x + (i * BattleNode.SPACE_BETWEEN_OBJECTS);
            object.y = this.y;
            
            this.emit(new GameEvent(GameEvent.BATTLE_ADD_ENEMY, object));
        }
    }

    removeObject(object){
        if(object.type === "player"){
            this.removePlayer(object);
            return;
        }

        for(let i = 0; i < this.numObjects; i++){
            if(this.objects[i] === object){
                object.battleNode = null;
                this.objects[i] = undefined;

                this.emit(new GameEvent(GameEvent.BATTLE_REMOVE_ENEMY, object));
                break;
            }
        }
    
        this.useReserveObject();

        if(this.numTotalObjects === 0){
            this.emit(new GameEvent(GameEvent.BATTLE_END));
        }
    }

    useReserveObject(){
        if(this.numReserveObjects > 0 && this.numObjects < BattleNode.MAX_OBJECTS){
            this.addObject(this.reserveObjects.shift());
        }
    }

    onObjectDeath(evt){
        let object = evt.emitter;
        this.removeObject(object);

        // reward player
        for(let player of this.players){
            if(player){
                player.addXP(object.xpReward);
                player.addMoney(object.moneyReward);
                player.addTokens(object.tokensReward);
            }
        }
    }

    getSpawnData(){
        return {
            x: this.x,
            y: this.y,
            nodeID: this.nodeID,
        };
    }

    getData(){
        let data = this.getSpawnData();
        data.players = {};
        data.enemies = {};

        for(let player of this.players){
            if(player){
                data.players[player.objectID] = player.getStats();
            }
        }

        for(let enemy of this.objects){
            if(enemy){
                data.enemies[enemy.objectID] = enemy.getStats();
            }
        }

        return data;
    }

    get numPlayers(){
        let i = 0;
        while(this.players[i]){
            i++;
        }
        return i;
    }

    get numObjects(){
        let i = 0;
        while(this.objects[i]){
            i++;
        }
        return i;
    }

    get numReserveObjects(){
        return this.reserveObjects.length;
    }

    get numTotalObjects(){
        return this.numObjects + this.numReserveObjects;
    }
};
BattleNode.lastNodeID = 0;
BattleNode.MAX_OBJECTS = 4;
BattleNode.SPACE_BETWEEN_OBJECTS = 120;

module.exports = BattleNode;