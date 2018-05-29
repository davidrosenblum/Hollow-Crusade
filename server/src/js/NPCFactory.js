let NPC = require("./NPC");

let NPCFactory = class NPCFactory{
    static create(type, x, y, teamID, ownerID, customName=null){
        let data = NPCFactory.getNPCData(type);
        if(data){
            let npc = new NPC(data);

            npc.x = x;
            npc.y = y;
            npc.ownerID = ownerID;
            npc.teamID = teamID;

            if(typeof customName === "string"){
                npc.name = name;
            }

            return npc;
        }
        else throw new Error(`NPC type '${type}' does not exist.`);
    }

    static setNPCData(rows){
        for(let row of rows){
            // the NPC constructor options argument requires camel case notation 
            NPCFactory.npcs[row.type] = {
                npcID:                  row.npc_id,
                type:                   row.type,
                name:                   row.name,
                level:                  row.level,
                moveSpeed:              row.move_speed,
                health:                 row.health,
                mana:                   row.mana,
                defensePhysical:        row.defense_physical,
                defenseElemental:       row.defense_elemental,
                resistancePhysical:     row.resistance_physical,
                resistanceElemental:    row.resistance_elemental,
                damageMultiplier:       row.damage_mult,
                criticalModifier:       row.crit_mod,
                criticalMultiplier:     row.crit_mult,
                xpReward:               row.reward_xp,
                moneyReward:            row.reward_money,
                tokensReward:           row.reward_tokens
            };
        }
    }

    static getNPCData(type){
        return NPCFactory.npcs[type] || null;
    }
};
NPCFactory.npcs = {}; // populated from database

module.exports = NPCFactory;