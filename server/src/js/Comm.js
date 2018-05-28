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
    BATTLE_NODE_CREATE:     17,
    BATTLE_NODE_DELETE:     18,
    BATTLE_NODE_UPDATE:     19,
    BATTLE_ENTER:           20,
    BATTLE_EXIT:            21,
    BATTLE_PLAYERS_TURN:    22,
    BATTLE_CPU_TURN:        23,
    BATTLE_SPELL_SELECT:    24,
    BATTLE_SPELL_CAST:      25
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