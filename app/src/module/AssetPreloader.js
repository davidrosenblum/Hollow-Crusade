import dark from '../lib/dark';

import dirtSrc from '../img/environment/dirt.png';
import grassSrc from '../img/environment/grass.png';
import grassDirtHorzSrc from '../img/environment/grass_dirt_horz.png';
import grassDirtVertSrc from '../img/environment/grass_dirt_vert.png';
import grassCliffSrc from '../img/environment/grass_cliff.png';

import wallSrc from '../img/environment/wall.png';
import wallCornerLeftSrc from '../img/environment/wall_corner_left.png';
import wallCornerRightSrc from '../img/environment/wall_corner_right.png';
import wallArchLeftSrc from '../img/environment/wall_arch_left.png';
import wallArchRightSrc from '../img/environment/wall_arch_right.png';

import player1Src from '../img/players/player1.png';
import player2Src from '../img/players/player2.png';
import player3Src from '../img/players/player3.png';
import player4Src from '../img/players/player4.png';

import skeletonSrc from '../img/monsters/skeleton.png';
import skeletonWarriorSrc from '../img/monsters/skeleton_warrior.png';
import animusSrc from '../img/monsters/animus.png';
import aberrationSrc from '../img/monsters/aberration.png';
import necromancerSrc from '../img/monsters/necromancer.png';
import gargoyleSrc from '../img/monsters/gargoyle.png';
import graveKnightSrc from '../img/monsters/grave_knight.png';
import infernalBehemothSrc from '../img/monsters/infernal_behemoth.png';
import deathKnightSrc from '../img/monsters/death_knight.png';
import consumedParagonSrc from '../img/monsters/consumed_paragon.png';
import fallenCrusaderSrc from '../img/monsters/fallen_crusader.png';
import meehanSrc from '../img/monsters/meehan.png';

import battleNodeSrc from '../img/gui/battle_node.png';
import portalNodeSrc from '../img/gui/portal_node.png';

let AssetPreloader = class AssetPreloader{
    static preloadAssets(){
        dark.AssetManager.loadImage(dirtSrc, null, "dirt");
        dark.AssetManager.loadImage(grassSrc, null, "grass");
        dark.AssetManager.loadImage(grassDirtHorzSrc, null, "grass_dirt_horz");
        dark.AssetManager.loadImage(grassDirtVertSrc, null, "grass_dirt_vert");
        dark.AssetManager.loadImage(grassCliffSrc, null, "grass_cliff");

        dark.AssetManager.loadImage(wallSrc, null, "wall");
        dark.AssetManager.loadImage(wallCornerLeftSrc, null, "wall_corner_left");
        dark.AssetManager.loadImage(wallCornerRightSrc, null, "wall_corner_right");
        dark.AssetManager.loadImage(wallArchLeftSrc, null, "wall_arch_left");
        dark.AssetManager.loadImage(wallArchRightSrc, null, "wall_arch_right");

        dark.AssetManager.loadImage(player1Src, null, "player1");
        dark.AssetManager.loadImage(player2Src, null, "player2");
        dark.AssetManager.loadImage(player3Src, null, "player3");
        dark.AssetManager.loadImage(player3Src, null, "player4");

        dark.AssetManager.loadImage(skeletonSrc, null, "skeleton");
        dark.AssetManager.loadImage(animusSrc, null, "animus");
        dark.AssetManager.loadImage(skeletonWarriorSrc, null, "skeleton-warrior");
        dark.AssetManager.loadImage(aberrationSrc, null, "aberration");
        dark.AssetManager.loadImage(necromancerSrc, null, "necromancer");
        dark.AssetManager.loadImage(gargoyleSrc, null, "gargoyle");
        dark.AssetManager.loadImage(graveKnightSrc, null, "grave-knight");
        dark.AssetManager.loadImage(infernalBehemothSrc, null, "infernal-behemoth");
        dark.AssetManager.loadImage(deathKnightSrc, null, "death-knight");
        dark.AssetManager.loadImage(consumedParagonSrc, null, "consumed-paragon");
        dark.AssetManager.loadImage(fallenCrusaderSrc, null, "fallen-crusader");
        dark.AssetManager.loadImage(meehanSrc, null, "meehan");

        dark.AssetManager.loadImage(battleNodeSrc, null, "battle-node");
        dark.AssetManager.loadImage(portalNodeSrc, null, "portal-node");
    }
};

export default AssetPreloader;