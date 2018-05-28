let PlayerSkins = class PlayerSkins{
    static setSkins(rows){
        for(let row of rows){
            PlayerSkins.Skins[row.skin_id] = row;
        }
    }

    static getSkin(id){
        return PlayerSkins.Skins[id];
    }
};
PlayerSkins.Skins = {};

module.exports = PlayerSkins;