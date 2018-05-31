/*
    PlayerSkins
    stores skins from the database and can retrieve stats for the given skin 

    (David)

    NOTE:
    think of skins like armor or gear
    it was originally going to be cosmetic only but later changed to having stats
*/
let PlayerSkins = class PlayerSkins{
    // store and format all skins from the database
    static setSkins(rows){
        for(let row of rows){
            PlayerSkins.skins[row.skin_id] = {
                skinID:                 row.skin_id,
                name:                   row.name,
                health:                 row.health,
                mana:                   row.mana,
                defensePhysical:        row.defense_physical / 100,     // convert nn% to 0.nn
                defenseElemental:       row.defense_elemental / 100,
                resistancePhysical:     row.resistance_physical / 100,
                resistanceElemental:    row.resistance_elemental / 100,
                damageMultiplier:       row.damage_mult / 100,
                criticalModifier:       row.critical_chance / 100,
                criticalMultiplier:     row.critical_mult / 100
            };
        }
    }

    // retrieves a skin by ID (not name like most)
    static getSkin(id){
        return PlayerSkins.skins[id];
    }
};
PlayerSkins.skins = {}; // populated from database

module.exports = PlayerSkins;