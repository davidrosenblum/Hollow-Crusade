import dark from '../lib/dark';

const GameObjects = {
    Player: class Player extends dark.GameObject{
        constructor(x, y){
            super("", x, y, 50, 50);
        }
    },

    SKINS: [
        "player1.png",
        "player2.png",
        "player3.png"
    ],

    getSkin: function(id){
        if(id < 0){
            return this.SKINS[0];
        }
        else if(id > this.SKINS.length){
            return this.SKINS[this.SKINS.length - 1];
        }
        return this.SKINS[id];
    },

    getClass(className){
        return this[className] || null;
    }
};

export default GameObjects;