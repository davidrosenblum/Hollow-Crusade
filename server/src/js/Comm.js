const OPC = {
    AUTH:                   1,
    LOGIN:                  2,
    LOGOUT:                 3,
    CHARACTER_LIST:         4,
    CHARACTER_SELECT:       5,
    CHARACTER_CREATE:       6,
    CHARACTER_DELETE:       7,
    ROOM_CHANGE:            8,
    ROOM_STATS:             9,
    CHAT_MESSAGE:           10,
    OBJECT_CREATE:          11,
    OBJECT_DELETE:          12,
    OBJECT_UPDATE:          13,
    OBJECT_STATS:           14,
    FX_SPAWN:               15,
    PLAYER_SKIN_CHANGE:     16,
    INSTANCE_ENTER:         17,
    INSTANCE_EXIT:          18,
    BATTLE_NODE_CREATE:     19,
    BATTLE_NODE_DELETE:     20,
    BATTLE_NODE_UPDATE:     21,
    BATTLE_ENTER:           22,
    BATTLE_EXIT:            23,
    BATTLE_PLAYERS_TURN:    24,
    BATTLE_CPU_TURN:        25,
    BATTLE_SPELL_SELECT:    26,
    BATTLE_SPELL_CAST:      27
};

const Status = {
    GOOD:   2,
    BAD:    4,
    ERR:    5
};

module.exports = {
    Status: Status,
    OPC: OPC
};