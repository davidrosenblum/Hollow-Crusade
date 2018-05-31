/*
    NPC (Non-Player Character)
    extension of the game combat object
    contains rewards applied to the players who defeat the object

    (David)
*/

// import modules
let GameCombatObject = require("./GameCombatObject");

let NPC = class NPC extends GameCombatObject{
    constructor(opts){
        opts = (!opts) ? {} : opts;

        super(opts);

        this.xpReward = (typeof opts.xpReward === "number") ? opts.xpReward : 0;
        this.moneyReward = (typeof opts.moneyReward === "number") ? opts.moneyReward : 0;
        this.tokensReward = (typeof opts.tokensReward === "number") ? opts.tokensReward : 0;
        this.isContact = (typeof opts.isContact === "boolean") ? opts.isContact : false;
    }

    // return GameCombatObject stats with new reward data
    getStats(){
        let stats = super.getStats();
        stats.xpReward = this.xpReward;
        stats.moneyReward = this.moneyReward;
        stats.tokensReward = this.tokensReward;
        return stats;
    }
};

module.exports = NPC;