import dark from '../lib/dark';
import GameController from '../module/GameController';

const MapObjects = {
    GrassTile: class GrassTile extends dark.Sprite{
        constructor(x, y){
            super("grass", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE);    
        }
    },

    GrassDirtHorzTile: class GrassDirtHorzTile extends dark.Sprite{
        constructor(x, y){
            super("grass_dirt_horz", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE);    
        }
    },

    GrassDirtVertTile: class GrassDirtVertTile extends dark.Sprite{
        constructor(x, y){
            super("grass_dirt_vert", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE);    
        }
    },

    DirtTile: class DirtTile extends dark.Sprite{
        constructor(x, y){
            super("dirt", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE);
        }
    },

    GrassCliffTile: class GrassCliffTile extends dark.Sprite{
        constructor(x, y){
            super("grass_cliff", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE * 2);

            this.setHitbox(this.width, this.height * 0.5);
        }
    },

    WallTile: class WallTile extends dark.Sprite{
        constructor(x, y){
            super("wall", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE * 2);
            
            this.setHitbox(this.width, this.height * 0.5);
        }
    },

    WallCornerLeftTile: class WallCornerLeftTile extends dark.Sprite{
        constructor(x, y){
            super("wall_corner_left", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE * 2);

            this.setHitbox(this.width, this.height * 0.5);
        }
    },

    WallCornerRightTile: class WallCornerLeftTile extends dark.Sprite{
        constructor(x, y){
            super("wall_corner_right", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE * 2);

            this.setHitbox(this.width, this.height * 0.5);
        }
    },

    WallArchLeftTile: class WallArchLeftTile extends dark.Sprite{
        constructor(x, y){
            super("wall_arch_left", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE * 1.5);
        }
    },

    WallArchRightTile: class WallArchRightTile extends dark.Sprite{
        constructor(x, y){
            super("wall_arch_right", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE * 1.5);
        }
    }
};

export default MapObjects;