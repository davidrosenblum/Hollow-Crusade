/*
    NPCFactory (Non-Player Character Factory)
    stores all NPC data from the database
    create NPC objects
    
    (David)
*/

// import modules
let NPC = require("./NPC");

let NPCFactory = class NPCFactory{
    // creates a new NPC based on the inputs
    // (see 'Comm.js' for expected type names)
    static create(type, x, y, ownerID, teamID, customName=null){
        let data = NPCFactory.getNPCData(type);
        if(data){
            // data retrieved
            let npc = new NPC(data);

            // apply arguments
            npc.x = x;
            npc.y = y;
            npc.ownerID = ownerID;
            npc.teamID = teamID;

            // set optional name
            if(typeof customName === "string"){
                npc.name = name;
            }

            return npc;
        }
        else throw new Error(`NPC type '${type}' does not exist.`);
    }

    // stores all the data for all the NPCs
    // this is called when the server initializes and pulls all the NPC data from the database
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
                defensePhysical:        1 + (row.defense_physical / 100),       // convert nn% to 0.nn
                defenseElemental:       1 + (row.defense_elemental),
                resistancePhysical:     1 + (row.resistance_physical / 100),
                resistanceElemental:    1 + (row.resistance_elemental / 100),
                damageMultiplier:       1 + (row.damage_mult / 100),
                criticalModifier:       row.crit_mod,
                criticalMultiplier:     1 + (row.crit_mult / 100),
                xpReward:               row.reward_xp,
                moneyReward:            row.reward_money,
                tokensReward:           row.reward_tokens
            };
        }
    }

    // retrieves data for the given NPC type 
    static getNPCData(type){
        return NPCFactory.npcs[type] || null;
    }
};
NPCFactory.npcs = {}; // populated from database

module.exports = NPCFactory;