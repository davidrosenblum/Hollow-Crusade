/*
    GameEvent
    should be used as the events to listen for in the 'EventEmitter'
    holds all expected event types used in the game

    (David)
*/

let GameEvent = class GameEvent{
    constructor(type, target, value){
        this.type = type;
        this.target=  target;
        this.value = value;
        this.emitter = null;    // set when the event is emitted by an emitter
        this.bubblers = null;   // set when the event is bubbled by an emitter
    }
};
GameEvent.BATTLE_CREATE = "battle-create";
GameEvent.BATTLE_START = "battle-start"
GameEvent.BATTLE_END = "battle-end";
GameEvent.BATTLE_PLAYERS_END = "battle-players-end";
GameEvent.BATTLE_ADD_ENEMY = "battle-add-enemy";
GameEvent.BATTLE_REMOVE_ENEMY = "battle-remove-enemy";
GameEvent.BATTLE_ADD_PLAYER = "battle-add-player";
GameEvent.BATTLE_REMOVE_PLAYER = "battle-remove-player";
GameEvent.PORTAL_NODE_CREATE = "portal-node-create";
GameEvent.PORTAL_NODE_DELETE = "portal-node-delete";
GameEvent.ROOM_ADD_OBJECT = "room-add-object";
GameEvent.ROOM_REMOVE_OBJECT = "room-remove-object";
GameEvent.ROOM_UPDATE_OBJECT = "room-update-object";
GameEvent.ROOM_ADD_SOCKET = "room-add-socket";
GameEvent.ROOM_REMOVE_SOCKET = "room-remove-socket";
GameEvent.UNIT_DODGE = "unit-dodge";
GameEvent.UNIT_UPDATE = "unit-update";
GameEvent.UNIT_DEATH = "unit-death";
GameEvent.PLAYER_XP = "player-xp"
GameEvent.PLAYER_LEVEL_UP = "player-level-up";
GameEvent.PLAYER_MONEY = "player-money";
GameEvent.PLAYER_POINTS = "player-points";
GameEvent.PLAYER_SKIN_CHANGE = "player-skin-change";
GameEvent.PLAYER_TOKENS = "player-tokens";
GameEvent.PLAYER_UPGRADE = "player-upgrade";
GameEvent.PLAYER_XP = "player-xp";

module.exports = GameEvent;