let PlayerSkins = class PlayerSkins{
    static setSkins(rows){
        for(let row of rows){
            PlayerSkins.skins[row.skin_id] = {
                skinID:                 row.skin_id,
                name:                   row.name,
                health:                 row.health,
                mana:                   row.mana,
                defensePhysical:        row.defense_physical / 100,
                defenseElemental:       row.defense_elemental / 100,
                resistancePhysical:     row.resistance_physical / 100,
                resistanceElemental:    row.resistance_elemental / 100,
                damageMultiplier:       row.damage_mult / 100,
                criticalModifier:       row.critical_chance / 100,
                criticalMultiplier:     row.critical_mult / 100
            };
        }
    }

    static getSkin(id){
        return PlayerSkins.skins[id];
    }
};
PlayerSkins.skins = {}; // populated from database

module.exports = PlayerSkins;