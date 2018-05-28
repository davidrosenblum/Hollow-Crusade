let GameCombatObject = require("./GameCombatObject"),
    GameEvent = require("./GameEvent");

let Player = class Player extends GameCombatObject{
    constructor(saveData){
        super({
            name: saveData.name,
            type: "player",
            moveSpeed: 2,
            health: 15,
            mana: 25
        });

        this.xp = 0;
        this.xpNeeded = 100;
        this.level = 1;

        this.money = (typeof saveData.money === "number") ? Math.max(0, saveData.money) : 0;
        this.points = (typeof saveData.points === "number") ? Math.max(0, saveData.points) : 0;
        this.tokens = (typeof saveData.tokens === "number") ? Math.max(0, saveData.tokens) : 0;

        this.skinID = (typeof saveData.skin_id === "number") ? Math.max(1,saveData.skin_id) : 1;

        this.spiritLevel = (typeof saveData.spirit_level === "number") ? Math.max(1, saveData.spirit_level) : 1;
        this.afflictionLevel = (typeof saveData.affliction_level === "number") ? Math.max(1, saveData.affliction_level) : 1;
        this.destructionLevel = (typeof saveData.destruction_level === "number") ? Math.max(1, saveData.destruction_level) : 1;
        this.weaponLevel = (typeof saveData.weapon_level === "number") ? Math.max(1, saveData.weapon_level) : 1;

        this.restoreLevel(Math.max(1,saveData.level));
        this.xp += Math.max(0, saveData.xp);
    }

    restoreLevel(level){
        for(let i = 1; i < level; i++){
            this.levelUp(false);
        }

        this.fillHealth();
        this.fillMana();
    }

    levelUp(emit=true){
        let nextLevel = this.level + 1;

        if(nextLevel <= Player.LEVEL_CAP){
            this.level++;
            this.xp = 0;
            this.xpNeeded *= 1.08;
            
            this.points++;

            this.healthCap += (this.level % 10);

            if(this.level % 2 === 0){
                this.manaCap++;
            }

            this.defense.physical += 0.003;
            this.defense.elemental += 0.002;

            this.criticalModifier += 0.001;
            this.criticalMultiplier += 0.0051;

            if(emit){
                this.emit(new GameEvent(GameEvent.PLAYER_LEVEL_UP, null, this.level));
            }
        }

        if(this.level === Player.LEVEL_CAP){
            this.healthCap++;
            this.xp = 1;
            this.xpNeeded = 1;
        }
    }

    fillHealth(){
        this.health = this.healthCap;
    }

    fillMana(){
        this.mana = this.manaCap;
    }

    addXP(xp){
        this.emit(new GameEvent(GameEvent.PLAYER_XP, null, xp));

        let xpRemaining = xp;
        
        while(this.xpToGo <= xpRemaining){
            xpRemaining -= this.xpToGo;
            this.levelUp();
        }

        this.xp += xpRemaining;
    }

    addMoney(amount){
        if(this.money < Player.MAX_MONEY){
            this.money += amount;

            if(this.money > Player.MAX_MONEY){
                this.money = Player.MAX_MONEY;
            }

            this.emit(new GameEvent(GameEvent.PLAYER_MONEY, null, amount));
        }
    }

    spendMoney(amount){
        if(this.money >= amount){
            this.money -= amount;

            this.emit(new GameEvent(GameEvent.PLAYER_MONEY, null, -amount));

            return true;
        }
        return false;
    }

    addPoints(amount){
        if(this.points < Player.MAX_POINTS){
            this.points += amount;

            if(this.points > Player.MAX_POINTS){
                this.points = Player.MAX_POINTS;
            }

            this.emit(new GameEvent(GameEvent.PLAYER_POINTS, null, amount));
        }
    }

    spendPoints(amount){
        if(this.points >= amount){
            this.points -= amount;
            
            this.emit(new GameEvent(GameEvent.PLAYER_POINTS, null, -amount));

            return true;
        }
        return false;
    }

    addTokens(amount){
        if(this.tokens < Player.MAX_TOKENS){
            this.tokens += amount;

            if(this.tokens > Player.MAX_TOKENS){
                this.tokens = Player.MAX_TOKENS;
            }

            this.emit(new GameEvent(GameEvent.PLAYER_TOKENS, null, amount));
        }
        
    }

    spendTokens(amount){
        if(this.tokens >= amount){
            this.tokens -= amount;

            this.emit(new GameEvent(GameEvent.PLAYER_TOKENS, null, -amount));

            return true;
        }
        return false;
    }

    upgrade(stat){
        if(this.spendPoints(1)){
            if(stat === "spirit"){
                this.spiritLevel++;
            }
            else if(stat === "affliction"){
                this.afflictionLevel++;
            }
            else if(stat === "destruction"){
                this.destructionLevel++;
            }
            else if(stat === "weapon"){
                this.weaponLevel++;
            }
            else{
                return false;
            }

            this.emit(new GameEvent(GameEvent.PLAYER_UPGRADE, null, stat));
        }
        return false;
    }

    get xpToGo(){
        return this.xpNeeded - this.xp;
    }

    getSaveData(){
        return {
            name: this.name,
            level: this.level,
            xp: this.xp,
            money: this.money,
            points: this.points,
            tokens: this.tokens,
            skin_id: this.skinID
        }
    }

    getSpawnData(){
        let data = super.getSpawnData();
        data.skinID = this.skinID;
        return data;
    }

    getStats(){
        let stats = super.getStats();
        stats.level = this.level;
        stats.xp = this.xp;
        stats.xpNeeded = this.xpNeeded;
        stats.money = this.money;
        stats.points = this.points;
        stats.tokens = this.tokens;
        stats.spiritLevel = this.spiritLevel;
        stats.afflictionLevel = this.afflictionLevel;
        stats.destructionLevel = this.destructionLevel;
        stats.weaponLevel = this.weaponLevel;
        return stats;
    }
};

Player.LEVEL_CAP = 50;
Player.MAX_MONEY = 999999;
Player.MAX_POINTS = 99;
Player.MAX_TOKENS = 999;

module.exports = Player;