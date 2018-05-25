let GameCombatObject = require("./GameCombatObject"),
    GameEvent = require("./GameEvent");

let Player = class Player extends GameCombatObject{
    constructor(saveData){
        super({
            name: saveData.name
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
        let lvls = level - 1;

        for(let i = 0; i < levels; i++){
            this.levelUp(false);
        }
    }

    levelUp(emit=true){
        let nextLevel = this.level + 1;

        if(nextLevel <= Player.LEVEL_CAP){
            this.level++;
            this.xp = 0;
            this.xpNeeded *= 1.08;
            
            this.points++;
            this.healthCap++;

            if(this.level % 2 === 0){
                this.manaCap++;
            }

            if(emit){
                this.emit(new GameEvent(GameEvent.PLAYER_LEVEL_UP, null, this.level));
            }
        }
    }

    addXP(xp){
        let xpRemaining = xp;
        
        while(this.xpToGo <= xpRemaining){
            xpRemaining -= this.xpToGo;
            this.levelUp();
        }

        this.xp += xpRemaining;

        this.emit(new GameEvent(GameEvent.PLAYER_XP, null, xp));
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
};

Player.LEVEL_CAP = 50;
Player.MAX_MONEY = 999999;
Player.MAX_POINTS = 99;
Player.MAX_TOKENS = 999;

module.exports = Player;