/*
    BattleNode 
    stores all relevant information to a battle
    includes players, enemies (+ enemy reinforcements)
    utilizes event-driven design
    battle nodes are created by rooms 

    (David)
*/

// import modules
let EventEmitter = require("./EventEmitter"),
    GameEvent = require("./GameEvent"),
    NPCFactory = require("./NPCFactory");

let BattleNode = class BattleNode extends EventEmitter{
    // nodes can only have {BattleNode.MAX_OBJECTS} at a time
    // BUT can be constructed with more that go into enemy reinforcements (summoned when the spot frees up)
    constructor(x, y, ownerID, teamID, objectTypes){
        super();

        this.nodeID = ++BattleNode.lastNodeID;

        // position, used to position the players/enemies into battle formation
        this.x = x;
        this.y = y;

        // battle member arrays
        this.players = new Array(BattleNode.MAX_OBJECTS);
        this.enemies = new Array(BattleNode.MAX_OBJECTS);
        this.enemyReinforcements = [];

        // these increase/decrease when players/enemies enter or exit
        this._numPlayers = 0;
        this._numEnemies = 0;

        // create and add each object...
        for(let i = 0, obj; i < objectTypes.length; i++){
            obj = NPCFactory.create(objectTypes[i], this.x, this.y, ownerID, teamID); 

            if(i < BattleNode.MAX_OBJECTS){
                // add to current mob
                // async to trigger on object add listener placed by room 
                setTimeout(() => this.addObject(obj), 1);
            }
            else{
                // add to reinforcement mob 
                this.enemyReinforcements.push(obj);
            }
        }
    }

    // stuff to do before the node is nullified
    destroy(){
        // (game turns ???)
    }

    // finds the first undefined/null index (-1 = full array)
    findEmptyIndex(array){
        for(let i = 0; i < array.length; i++){
            if(array[i] === undefined || array[i] === null){
                return i;
            }
        }
        return -1;
    }

    // adds a player to the battle 
    addPlayer(player){
        if(this.numPlayers + 1 <= BattleNode.MAX_OBJECTS){
            let i = this.findEmptyIndex(this.players);
            this.players[i] = player;

            player.battleNode = this;
            player.x = this.x;
            player.y = this.y + (i * BattleNode.SPACE_BETWEEN_OBJECTS_Y);

            this._numPlayers++;

            this.emit(new GameEvent(GameEvent.BATTLE_ADD_PLAYER, player));
        }
    }

    // removes a player from the battle
    removePlayer(player){
        for(let i = 0; i < this.numPlayers; i++){
            if(this.players[i] === player){
                player.battleNode = null;
                
                this.players[i] = undefined;
                this._numPlayers--;

                this.emit(new GameEvent(GameEvent.BATTLE_REMOVE_PLAYER, player));
                break;
            }
        }

        if(this.numPlayers === 0){
            this.emit(new GameEvent(GameEvent.BATTLE_PLAYERS_END));
        }
    }

    // adds any object to the battle, determines if its a player otherwise its an enemy
    addObject(object){
        if(object.type === "player"){
            this.addPlayer(object);
        }
        else if(this.numEnemies + 1 <= BattleNode.MAX_OBJECTS){
            // find next available battle slot
            let i = this.findEmptyIndex(this.enemies);

            // associate object
            this.enemies[i] = object;
            object.battleNode = this;

            this._numEnemies++;

            // position object
            object.x = this.x + BattleNode.SPACE_BETWEEN_OBJECTS_X;
            object.y = this.y + (i * BattleNode.SPACE_BETWEEN_OBJECTS_Y);

            // remove and give rewards on death...
            object.on(GameEvent.UNIT_DEATH, this.onEnemyDeath.bind(this));
            
            // trigger listeners (room will add the object)
            this.emit(new GameEvent(GameEvent.BATTLE_ADD_ENEMY, object));
        }
    }

    // removes any object from the battle, determines if its a player otherwise its an enemy
    removeObject(object){
        // player?
        if(object.type === "player"){
            this.removePlayer(object);
            return;
        }

        // its an enemy... remove enemy
        for(let i = 0; i < this.numEnemies; i++){
            if(this.enemies[i] === object){
                // battle slot is 'i', remove associations with battle
                object.battleNode = null;
                this.enemies[i] = undefined;
                
                this._numEnemies--;

                // trigger listeners (room will remove object)
                this.emit(new GameEvent(GameEvent.BATTLE_REMOVE_ENEMY, object));
                break;
            }
        }

        // since an enemy was removed from the battle, attempt to fill its slot with reinforcements 
        this.useEnemyReinforcements();

        // no enemies or reinforcements, the battle is over
        // trigger listeners (room and server will free the players)
        if(this.numTotalEnemies === 0){
            this.emit(new GameEvent(GameEvent.BATTLE_END));
        }
    }

    // if an enemy reinforcement exists, it will be moved to the main battle group 
    useEnemyReinforcements(){
        if(this.numEnemyReinforcements > 0 && this.numEnemies < BattleNode.MAX_OBJECTS){
            this.addObject(this.enemyReinforcements.shift());
        }
    }

    // death event handler, removes object and 
    onEnemyDeath(evt){
        let object = evt.emitter;
        this.removeObject(object);

        // reward players
        this.forEachPlayer(player => {
            player.addXP(object.xpReward);
            player.addMoney(object.moneyReward);
            player.addTokens(object.tokensReward);
        });
    }

    // lambda funtion for each player
    forEachPlayer(fn){
        for(let i = 0; i < this.numPlayers; i++){
            if(this.players[i]){
                fn(this.players[i], i);
            }
        }
    }

    // gets the spawn info for the client to make the battle node entrance
    getSpawnData(){
        return {
            x: this.x,
            y: this.y,
            nodeID: this.nodeID,
        };
    }

    // specific info about the battle node
    getData(){
        let data = this.getSpawnData();
        data.players = {};
        data.enemies = {};

        for(let player of this.players){
            if(player){
                data.players[player.objectID] = player.getStats();
            }
        }

        for(let enemy of this.enemies){
            if(enemy){
                data.enemies[enemy.objectID] = enemy.getStats();
            }
        }

        return data;
    }

    // player count
    get numPlayers(){
        return this._numPlayers;
    }

    // enemy count (without reinforcements)
    get numEnemies(){
        return this._numEnemies;
    }

    // reinforcement count
    get numEnemyReinforcements(){
        return this.enemyReinforcements.length;
    }

    // total enemy count 
    get numTotalEnemies(){
        return this.numEnemies + this.numEnemyReinforcements;
    }
};
BattleNode.lastNodeID = 0;
BattleNode.MAX_OBJECTS = 4
BattleNode.SPACE_BETWEEN_OBJECTS_X = (96*2);
BattleNode.SPACE_BETWEEN_OBJECTS_Y = 100;

module.exports = BattleNode;