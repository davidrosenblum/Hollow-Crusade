import dark from '../lib/dark';
import GameController from './GameController';

const GameObjects = {
    Skeleton: class Skeleton extends dark.GameObject{
        constructor(x, y){
            super("skeleton", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    Animus: class Animus extends dark.GameObject{
        constructor(x, y){
            super("animus", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    SkeletonWarrior: class SkeletonWarrior extends dark.GameObject{
        constructor(x, y){
            super("skeleton-warrior", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    Aberration: class Aberration extends dark.GameObject{
        constructor(x, y){
            super("aberration", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    Necromancer: class Necromancer extends dark.GameObject{
        constructor(x, y){
            super("necromancer", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    Gargoyle: class Gargoyle extends dark.GameObject{
        constructor(x, y){
            super("gargoyle", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    GraveKnight: class GraveKnight extends dark.GameObject{
        constructor(x, y){
            super("grave-knight", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    InfernalBehemoth: class InfernalBehemoth extends dark.GameObject{
        constructor(x, y){
            super("infernal-behemoth", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    DeathKnight: class DeathKnight extends dark.GameObject{
        constructor(x, y){
            super("death-knight", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    ConsumedParagon: class ConsumedParagon extends dark.GameObject{
        constructor(x, y){
            super("consumed-paragon", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    FallenCrusader: class FallenCrusader extends dark.GameObject{
        constructor(x, y){
            super("fallen-crusader", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    Meehan: class Meehan extends dark.GameObject{
        constructor(x, y){
            super("meehan", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }
    },

    PortalNode: class PortalNode extends dark.Sprite{
        constructor(x, y){
            super("portal-node", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE);
        }
    },

    BattleNode: class BattleNode extends dark.Sprite{
        constructor(x, y){
            super("battle-node", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE);
        }
    },

    Player: class Player extends dark.GameObject{
        constructor(x, y){
            super("player1", x, y, GameController.CELL_SIZE * 0.75, GameController.CELL_SIZE);

            this.setHitbox(this.width, this.height * 0.25);
        }

        setSkin(id){
            this.changeImage(GameObjects.getSkin(id));
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