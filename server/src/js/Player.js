/*
    Player
    loads a player from a database save
    contains leveling and rewards data
    can apply different skins with stats

    (David)
*/

// import modules
let GameCombatObject = require("./GameCombatObject"),
    GameEvent = require("./GameEvent"),
    PlayerSkins = require("./PlayerSkins");

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
        this.lastMapID = (typeof saveData.map_id === "number") ? Math.max(1, saveData.map_id) : 1;
        
        this.spiritLevel = (typeof saveData.spirit_level === "number") ? Math.max(1, saveData.spirit_level) : 1;
        this.afflictionLevel = (typeof saveData.affliction_level === "number") ? Math.max(1, saveData.affliction_level) : 1;
        this.destructionLevel = (typeof saveData.destruction_level === "number") ? Math.max(1, saveData.destruction_level) : 1;
        this.weaponLevel = (typeof saveData.weapon_level === "number") ? Math.max(1, saveData.weapon_level) : 1;

        this.restoreLevel(Math.max(1,saveData.level));

        if(this.level < Player.LEVEL_CAP){
            this.xp += Math.max(0, saveData.xp);
        }

        this.applySkinOnLoad(this.skinID);
    }

    // should be called on init, levels a player back up without triggering events 
    restoreLevel(level){
        level = Math.max(1, level);
        level = Math.min(50, level);

        for(let i = 1; i < level; i++){
            this.levelUp(true); // 'true' means don't fire level listeners 
        }

        this.fillHealth();
        this.fillMana();
    }

    // adds 1 level to the player
    levelUp(isRestoring=false){
        let nextLevel = this.level + 1;

        // don't level past cap 
        if(nextLevel <= Player.LEVEL_CAP){
            this.level = nextLevel;
            this.xp = 0;
            this.xpNeeded *= 1.10;

            let n = Math.floor(this.level / 10);

            // levels 1-19
            if(n === 0 || n === 1) this.healthCap +=1; 
            // levels 20-39
            else if(n === 2 || n === 3) this.healthCap += 2;
            // levels 40-49
            else if(n === 4) this.healthCap += 3;
            // levels 50+
            else this.healthCap += 4;

            if(this.level % 2 === 0){
                this.manaCap++;
            }

            //this.defense.physical += 0.003;
            //this.defense.elemental += 0.002;

            this.criticalModifier += 0.001;
            this.criticalMultiplier += 0.0051;
        }

        if(this.level === Player.LEVEL_CAP){
            this.xp = 1;
            this.xpNeeded = 1;
        }

        this.fillHealth();
        this.fillMana();

        if(!isRestoring){
            this.emit(new GameEvent(GameEvent.PLAYER_LEVEL_UP, null, this.level));
            this.addPoints(1);
        }
    }

    fillHealth(){
        this.health = this.healthCap;
    }

    fillMana(){
        this.mana = this.manaCap;
    }

    addXP(xp){
        if(xp === 0 || this.level === Player.LEVEL_CAP){
            return;
        }

        let xpRemaining = xp,
            levelsEarned = 0,
            xpToGo = this.xpNeeded - this.xp;
        
        while(xpRemaining > 0 && xpToGo <= xpRemaining && this.level < Player.LEVEL_CAP){
            this.levelUp();
            xpRemaining -= xpToGo;
            xpToGo = this.xpNeeded - this.xp;
        }

        if(this.level !== Player.LEVEL_CAP){
            this.xp += xpRemaining;
        }

        this.emit(new GameEvent(GameEvent.PLAYER_XP, null, xp));
    }

    addMoney(amount){
        if(amount > 0 && this.money < Player.MAX_MONEY){
            this.money = Math.min(this.money + amount, Player.MAX_MONEY);
            this.emit(new GameEvent(GameEvent.PLAYER_MONEY, null, amount));  
        }
    }

    spendMoney(amount){
        if(this.money >= amount){
            this.money -= amount;

            this.emit(new GameEvent(GameEvent.PLAYER_POINTS, null, -amount));
            return true;
        }
        return false;
    }

    addPoints(amount){
        if(amount > 0 && this.points < Player.MAX_POINTS){
            this.points = Math.min(this.points + amount, Player.MAX_POINTS);
            this.emit(new GameEvent(GameEvent.PLAYER_POINTS, null, amount));  
        }
    }

    spendPoints(amount){
        if(this.points >= amount){
            this.points -= amount;
            
            this.emit(new GameEvent(GameEvent.PLAYER_POINTS, null, amount));
            return true;
        }
        return false;
    }

    addTokens(amount){
        if(amount > 0 && this.tokens < Player.MAX_TOKENS){
            this.tokens = Math.min(this.tokens + amount, Player.MAX_TOKENS);
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

    applySkinOnLoad(id){
        let currSkin = PlayerSkins.getSkin(this.skinID);
        if(!currSkin){
            throw new Error(`Skin ${this.skinID} does not exist.`);
        }

        this.healthCap += currSkin.health;
        this.manaCap += currSkin.mana;
        this.defense.physical += currSkin.defensePhysical;
        this.defense.elemental += currSkin.defenseElemental;
        this.resistance.physical += currSkin.resistancePhysical;
        this.resistance.elemental += currSkin.resistanceElemental;
        this.damageMultiplier += currSkin.damageMultiplier;
        this.criticalModifier += currSkin.criticalModifier;
        this.criticalMultiplier += currSkin.criticalMultiplier;

        this.skinID = id;
        this.fillHealth();
        this.fillMana();
    }

    applySkin(id){
        if(this.skinID === id){
            return;
        }

        // find new skin data
        let newSkin = PlayerSkins.getSkin(id);
        if(!newSkin){
            throw new Error(`Skin ${id} does not exist.`);
        }

        let currSkin = PlayerSkins.getSkin(this.skinID);
        if(!currSkin){
            throw new Error(`Skin ${this.skinID} does not exist.`);
        }

        this.healthCap -= currSkin.health;
        this.manaCap -= currSkin.mana;
        this.defense.physical -= currSkin.defensePhysical;
        this.defense.elemental -= currSkin.defenseElemental;
        this.resistance.physical -= currSkin.resistancePhysical;
        this.resistance.elemental -= currSkin.resistanceElemental;
        this.damageMultiplier -= currSkin.damageMultiplier;
        this.criticalModifier -= currSkin.criticalModifier;
        this.criticalMultiplier -= currSkin.criticalMultiplier;
        
        // apply new skin bonuses
        this.healthCap += newSkin.health;
        this.manaCap += newSkin.mana;
        this.defense.physical += newSkin.defensePhysical;
        this.defense.elemental += newSkin.defenseElemental;
        this.resistance.physical += newSkin.resistancePhysical;
        this.resistance.elemental += newSkin.resistanceElemental;
        this.damageMultiplier += newSkin.damageMultiplier;
        this.criticalModifier += newSkin.criticalModifier;
        this.criticalMultiplier += newSkin.criticalMultiplier;

        // set new skin
        this.skinID = id;
        this.fillHealth();
        this.fillMana();

        this.emit(new GameEvent(GameEvent.PLAYER_SKIN_CHANGE, null, newSkin));
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