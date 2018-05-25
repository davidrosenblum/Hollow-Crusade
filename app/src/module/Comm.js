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
    BATTLE_NODE_CREATE:     16,
    BATTLE_NODE_DELETE:     17,
    BATTLE_NODE_UPDATE:     18,
    BATTLE_ENTER:           19,
    BATTLE_EXIT:            20,
    BATTLE_PLAYERS_TURN:    21,
    BATTLE_CPU_TURN:        22,
    BATTLE_SPELL_SELECT:    23,
    BATTLE_SPELL_CAST:      24
};

const Status = {
    GOOD:   2,
    BAD:    4,
    ERR:    5
};

export { OPC, Status };