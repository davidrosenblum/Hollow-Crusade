/*
    GameCombatObject
    'abstract' superclass for all combat objects
    holds additional character information, such as name, team, and owner IDs
    hols all combat information (health, modifiers, etc)
    can calculate damage, dodges, criticals
    can fight other game combat objecs

    (David)
*/

// import modules
let GameEvent = require("./GameEvent"),
    GameObject = require("./GameObject");

let GameCombatObject = class GameCombatObject extends GameObject{
    constructor(opts){
        opts = (!opts) ? {} : opts;

        super(opts);

        this.battleNode = null;
        
        this.name = (typeof opts.name === "string") ? opts.name : "";
        this.type = (typeof opts.type === "string") ? opts.type : "";

        this.ownerID = (typeof opts.ownerID === "number") ? opts.ownerID : -1;
        this.teamID = (typeof opts.teamID === "number") ? opts.teamID : -1;

        this.healthCap = (typeof opts.health === "number") ? opts.health : 1;
        this.health = this.healthCap;

        this.manaCap = (typeof opts.mana === "number") ? opts.mana : 1;
        this.mana = this.manaCap;

        this.criticalModifier = (typeof opts.criticalModifier === "number") ? opts.criticalModifier : 0;
        this.criticalMultiplier = (typeof opts.criticalMultiplier === "number") ? opts.criticalMultiplier : 1.25;
        this.damageMultiplier = (typeof opts.damageMultiplier === "number") ? opts.damageMultiplier : 1;

        this.defense = {
            physical: (typeof opts.physicalDefense === "number") ? opts.physicalDefense : 0,
            elemental: (typeof opts.elementalDefense === "number") ? opts.elementalDefense : 0
        };

        this.resistance = {
            physical: (typeof opts.physicalResistance === "number") ? opts.physicalResistance : 0,
            elemental: (typeof opts.elementalResistance === "number") ? opts.elementalResistance : 0
        };

        this.moveSpeed = (typeof opts.moveSpeed === "number") ? opts.moveSpeed : 1;
    }

    // takes PRECALCULATED damage from the attacker, applies resistances and defenses
    takeDamageFrom(damage, damageType, attacker){
        if(this.rollDodge(damageType)){
            this.emit(new GameEvent(GameEvent.UNIT_DODGE, attacker, damage));
            return false;
        }

        damage -= damage * (this.resistance[damageType] || 0);
        this.health -= damage;

        if(this.health <= 0){
            this.emit(new GameEvent(GameEvent.UNIT_DEATH, attacker, damage));
            return true;
        }
        return false;
    }

    // roll to dodge the attack completely
    rollDodge(damageType){
        return Math.random() + (this.defense[damageType] || 0) >= GameCombatObject.DEF_ROLL_REQUIRED; 
    }

    // roll to determine if critical damage should be applied
    rollCritical(){
        return Math.random() + this.criticalModifier >= GameCombatObject.CRIT_ROLL_REQUIRED;
    }

    // roll to determine critical damage and apply if neccessary 
    rollAndApplyCritical(initDamage){
        if(this.rollCritical()){
            // emit critical?
            return initDamage * this.criticalMultiplier;
        }
        return initDamage;
    }

    // adds health and obeys health capacity
    addHealth(hp){
        this.health += hp;
        if(this.health >= this.healthCap){
            this.health = this.healthCap;
        }
    }

    // adds mana and obeys mana capacity 
    addMana(mp){
        this.mana += mp;
        if(this.mana >= this.manaCap){
            this.mana = this.manaCap;
        }
    }

    // all the info needed for the client to create this object
    getSpawnData(){
        let data = this.getData();
        
        data.ownerID = this.ownerID,
        data.teamID = this.teamID;
        data.name = this.name;
        data.type = this.type;
        data.moveSpeed = this.moveSpeed;
        //data.battleNodeID = (this.battleNode) ? this.battleNode.nodeID : -1;

        return data;
    }

    // stats object, includes every detail needed about this object 
    getStats(){
        let stats = this.getData();
        stats.name = this.name;
        stats.type = this.type;
        stats.teamID = this.teamID;
        stats.moveSpeed = this.moveSpeed;
        stats.health = this.health;
        stats.healthCap = this.healthCap;
        stats.mana = this.mana;
        stats.manaCap = this.manaCap;
        stats.defensePhysical = this.defense.physical;
        stats.defenseElemental = this.defense.elemental;
        stats.resistancePhysical = this.resistance.physical;
        stats.resistanceElemental = this.resistance.elemental;
        stats.criticalModifier = this.criticalModifier;
        stats.criticalMultiplier = this.criticalMultiplier;
        stats.damageMultiplier = this.damageMultiplier;
        return stats;
    }

    toString(){
        return `${this.name}:${this.type}`;
    }
};

GameCombatObject.DEF_ROLL_REQUIRED = 0.8;   // min value required to dodge an attack
GameCombatObject.CRIT_ROLL_REQUIRED = 0.7;  // min value required to deal critical damage

module.exports = GameCombatObject;