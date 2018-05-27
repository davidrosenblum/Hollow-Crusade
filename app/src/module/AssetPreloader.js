import dark from '../lib/dark';

import grassSrc from '../img/grass.png';
import grassDirtHorzSrc from '../img/grass_dirt_horz.png';
import grassDirtVertSrc from '../img/grass_dirt_vert.png';

import wallSrc from '../img/wall.png';
import wallCornerLeftSrc from '../img/wall_corner_left.png';
import wallCornerRightSrc from '../img/wall_corner_right.png';
import wallArchLeftSrc from '../img/wall_arch_left.png';
import wallArchRightSrc from '../img/wall_arch_right.png';

import player1Src from '../img/player1.png';
import player2Src from '../img/player2.png';
import player3Src from '../img/player3.png';

let AssetPreloader = class AssetPreloader{
    static preloadAssets(){
        dark.AssetManager.loadImage(grassSrc, null, "grass");
        dark.AssetManager.loadImage(grassDirtHorzSrc, null, "grass_dirt_horz");
        dark.AssetManager.loadImage(grassDirtVertSrc, null, "grass_dirt_vert");
        dark.AssetManager.loadImage(wallSrc, null, "wall");
        dark.AssetManager.loadImage(wallCornerLeftSrc, null, "wall_corner_left");
        dark.AssetManager.loadImage(wallCornerRightSrc, null, "wall_corner_right");
        dark.AssetManager.loadImage(wallArchLeftSrc, null, "wall_arch_left");
        dark.AssetManager.loadImage(wallArchRightSrc, null, "wall_arch_right");
        dark.AssetManager.loadImage(player1Src, null, "player1");
        dark.AssetManager.loadImage(player2Src, null, "player2");
        dark.AssetManager.loadImage(player3Src, null, "player3");
    }
};

export default AssetPreloader;