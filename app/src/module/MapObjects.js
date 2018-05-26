import dark from '../lib/dark';
import GameController from '../module/GameController';

const MapObjects = {
    GrassTile: class GrassTile extends dark.Sprite{
        constructor(x, y){
            super("grass.png", x, y, GameController.CELL_SIZE, GameController.CELL_SIZE);    
        }
    }
};

export default MapObjects;