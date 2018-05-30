// op codes enum
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

// status codes enum
const Status = {
    GOOD:   2,
    BAD:    4,
    ERR:    5
};

// team IDs enum
const Teams = {
    PLAYERS: 1,
    ENEMIES: 2,
    NEUTRALS: 3
};

// static owner IDs enum
const Owners = {
    ENEMIES: 1,
    FRIENDS: 2,
    PLAYERS_START: 5
};

// static combat object IDs enum
const CombatObjects = {
    PLAYER: "player",
    SKELETON: "skeleton",
    ANIMUS: "animus",
    SKELETON_WARRIOR: "skeleton-warrior",
    ABERRATION: "aberration",
    NECROMANCER: "necromancer",
    GARGOYLE: "gargoyle",
    GRAVE_KNIGHT: "grave-knight",
    INFERNAL_BEHEMOTH: "infernal-behemoth",
    DEATH_KNIGHT: "death-knight",
    CONSUMED_PARAGON: "consumed-paragon",
    FALLEN_CRUSADER: "fallen-crusader",
    MEEHAN: "meehan"
};

module.exports = {
    Status: Status,
    OPC: OPC,
    Teams: Teams,
    Owners: Owners,
    CombatObjects: CombatObjects
};