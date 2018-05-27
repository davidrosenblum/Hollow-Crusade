import dark from '../lib/dark';
import GameController from './GameController';

const GameObjects = {
    Player: class Player extends dark.GameObject{
        constructor(x, y){
            super("player1", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    SKINS: [
        "player1",  // database doesn't recognize skin 0
        "player1",
        "player2",
        "player3"
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