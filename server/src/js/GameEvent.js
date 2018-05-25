let GameEvent = class GameEvent{
    constructor(type, target, value){
        this.type = type;
        this.target=  target;
        this.value = value;
        this.emitter = null;
    }
};
GameEvent.ROOM_ADD_OBJECT = "room-add-object";
GameEvent.ROOM_DELETE_OBJECT = "room-delete-object";
GameEvent.ROOM_UPDATE_OBJECT = "room-update-object";
GameEvent.ROOM_ADD_SOCKET = "room-add-socket";
GameEvent.ROOM_REMOVE_SOCKET = "room-remove-socket";
GameEvent.UNIT_UPDATE = "unit-update";
GameEvent.UNIT_DEATH = "unit-death";
GameEvent.PLAYER_XP = "player-xp"
GameEvent.PLAYER_LEVEL_UP = "player-level-up";
GameEvent.PLAYER_MONEY = "player-money";
GameEvent.PLAYER_POINTS = "player-points";
GameEvent.PLAYER_TOKENS = "player-tokens";
GameEvent.PLAYER_UPGRADE = "player-upgrade";
GameEvent.PLAYER_XP = "player-xp";

module.exports = GameEvent;