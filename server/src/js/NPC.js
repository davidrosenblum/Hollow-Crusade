let GameCombatObject = require("./GameCombatObject");

let NPC = class NPC extends GameCombatObject{
    constructor(opts){
        opts = (!opts) ? {} : opts;

        super(opts);

        this.xpReward = (typeof opts.xpReward === "number") ? opts.xpReward : 0;
        this.moneyReward = (typeof opts.moneyReward === "number") ? opts.moneyReward : 0;
        this.teamName = (typeof opts.teamName === "string") ? opts.teamName : null;
        this.isContact = (typeof opts.isContact === "boolean") ? opts.isContact : false;
    }

    getStats(){
        let stats = super.getStats();
        stats.teamName = this.teamName;
        stats.isContact = this.isContact;
        return stats;
    }
};

module.exports = NPC;