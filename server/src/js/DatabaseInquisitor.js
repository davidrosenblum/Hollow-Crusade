/*
    DatabaseInquisitor 
    uses a mysql database connector to query the databas, includes....
        * all table creation, selection, & insertion queries
        * account creation (with password salting/hashing) + password reset 
        * character creation / retrieval / update / deletion (CRUD!) 
    
    (David)
*/

// all possible characters to use in hashing (and salts)
const HASH_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(""),
    SALT_SIZE = 128; // minimum salt 

let DatabaseInquisitor = class DatabaseInquisitor{
    constructor(mysqlConn){
        this.conn = mysqlConn;
        this.createTables();
    }

    // creates a hash key for the given input, optional salt can be applied 
    hash(str, salt=null){
        let input = str + (salt || ""),
            output = "";

        // hash each character (double the character code plus the offset mod the hashtable size)
        for(let i = 0, cc; i < input.length; i++){
            cc = input.charCodeAt(i) * 2 + i;

            output += HASH_CHARS[cc % HASH_CHARS.length]
        }

        return output;
    }

    // creates a random string to append to the end of password based off of the size of the password
    generateSalt(initStr){
        // how many characters to generate? 
        let size = SALT_SIZE - (initStr ? initStr.length : 0),
            salt = "";

        // password is too long for a salt 
        if(size < 1){
            return "";
        }

        // generate characters (random hash characters)
        for(let i = 0; i < size; i++){
            salt += HASH_CHARS[Math.trunc(Math.random() * HASH_CHARS.length)];
        }

        return salt;
    }

    createAccount(username, password, callback){
        let salt = this.generateSalt(password),
            passHash = this.hash(password, salt);

        this.conn.query(
            `INSERT INTO accounts(username, password)
            VALUES('${username}', '${passHash}')`,
            err => {
                if(!err){
                    this.conn.query(
                        `INSERT INTO salts(account_id, salt)
                        VALUES(
                            (
                                SELECT account_id FROM accounts
                                WHERE username = '${username}'
                            ),
                            '${salt}'   
                        )`,
                        callback
                    )
                }
                else{
                    callback(err);
                }
            }
        );
    }

    changePassword(username, newPassword, callback){
        let newSalt = this.generateSalt(newPassword),
            passHash = this.hash(newPassword, newSalt);

        this.conn.query(
            `UPDATE accounts
            SET password = '${passHash}'
            WHERE username = '${username}'`,
            err => {
                if(!err){
                    this.conn.query(
                        `UPDATE salts
                        SET salt = '${newSalt}'
                        WHERE account_id = (
                            SELECT account_id FROM accounts
                            WHERE username = '${username}'
                        )`,
                        callback
                    );
                }
                else{
                    callback(err);
                }
            }
        );
    }

    retrieveAccount(username, callback){
        this.conn.query(
            `SELECT * FROM accounts
            WHERE username = '${username}'`,
            callback
        );
    }

    retrieveAccountWithHash(username, callback){
        this.conn.query(
            `SELECT * FROM accounts a
            JOIN salts s
            ON a.account_id = s.account_id
            WHERE username = '${username}'`,
            callback
        );
    }

    createCharacter(username, name, skinID=1, callback){
        this.conn.query(
            `INSERT INTO characters(account_id, name, skin_id)
            VALUES(
                (
                    SELECT account_id FROM accounts
                    WHERE username = '${username}'
                ),
                '${name}',
                ${skinID}
            )`,
            callback
        );
    }

    retrieveCharacter(username, name, callback){
        this.conn.query(
            `SELECT * FROM characters
            WHERE name = '${name}'`,
            callback
        );
    }

    retrieveCharacterList(username, callback){
        this.conn.query(
            `SELECT c.name, c.level, c.skin_id, m.name AS 'map_name'
            FROM characters c
            JOIN maps m
            ON c.map_id = m.map_id
            WHERE account_id = (
               SELECT account_id FROM accounts
               WHERE username = '${username}' 
            )`,
            callback
        );
    }

    updateCharacter(data, callback){
        let name = data.name;
        if(!name){
            callback(new Error("Can't update - name missing!"));
        }

        let set = "";
        for(let k in data){
            if(k === "name"){
                continue;
            }

            if(typeof data[k] === "string"){
                set += `${k} = '${data[k]}', `;
            }
            else{
                set += `${k} = ${data[k]}, `;
            }
        }
        set = set.substring(0, set.length - 2);

        this.conn.query(
            `UPDATE characters
            SET ${set}
            WHERE name = '${name}'`,
            callback
        );
    }

    deleteCharacter(username, name, callback){
        this.conn.query(
            `DELETE FROM characters 
            WHERE name = '${name}' AND account_id = (
                SELECT account_id FROM accounts
                WHERE username = '${username}'
            )`,
            callback
        )   
    }

    loadMaps(callback){
        this.conn.query(
            "SELECT * FROM maps",
            callback
        );
    }

    loadSkins(callback){
        this.conn.query(
            "SELECT * FROM skins",
            callback
        );
    }

    loadNPCs(callback){
        this.conn.query(
            `SELECT * FROM npcs`,
            callback
        );
    }

    createAccountsTable(){
        this.conn.query(
            `CREATE TABLE IF NOT EXISTS accounts(
                account_id INT AUTO_INCREMENT UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                access_level TINYINT NOT NULL DEFAULT 1,
                status ENUM('enabled', 'disabled') NOT NULL DEFAULT 'enabled',
                date_joined DATETIME NOT NULL DEFAULT NOW(),
                PRIMARY KEY (account_id)
            )`,
            err => {if(err) console.log(err.message)}
        );
    }

    createSaltsTable(){
        this.conn.query(
            `CREATE TABLE IF NOT EXISTS salts(
                account_id INT UNIQUE NOT NULL,
                salt VARCHAR(255) NOT NULL,
                PRIMARY KEY(account_id, salt),
                FOREIGN KEY (account_id) REFERENCES accounts(account_id)
                    ON DELETE CASCADE
            )`,
            err => {if(err) console.log(err.message)}
        );
    }

    createMapsTables(){
        this.conn.query(
            `CREATE TABLE IF NOT EXISTS maps(
                map_id INT UNIQUE NOT NULL,
                name VARCHAR(255) UNIQUE NOT NULL,
                min_level TINYINT NOT NULL DEFAULT 1,
                start_x FLOAT NOT NULL DEFAULT 0,
                start_y FLOAT NOT NULL DEFAULT 0,
                PRIMARY KEY (map_id)
            )`,
            err => {if(err) console.log(err.message)}
        );
    }

    createSkinsTable(){
        this.conn.query(
            `CREATE TABLE IF NOT EXISTS skins(
                skin_id INT AUTO_INCREMENT UNIQUE NOT NULL,
                name VARCHAR(255) UNIQUE NOT NULL,
                level TINYINT NOT NULL DEFAULT 1,
                money INT NOT NULL DEFAULT 1,
                tokens TINYINT NOT NULL DEFAULT 0,
                health SMALLINT NOT NULL DEFAULT 0,
                mana SMALLINT NOT NULL DEFAULT 0,
                defense_physical TINYINT NOT NULL DEFAULT 0,
                defense_elemental TINYINT NOT NULL DEFAULT 0,
                resistance_physical TINYINT NOT NULL DEFAULT 0,
                resistance_elemental TINYINT NOT NULL DEFAULT 0,
                damage_mult SMALLINT NOT NULL DEFAULT 0, 
                critical_chance TINYINT NOT NULL DEFAULT 0,
                critical_mult SMALLINT NOT NULL DEFAULT 0,
                PRIMARY KEY (skin_id)
            )`,
            err => {if(err) console.log(err.message)}
        );
    }

    createNPCsTable(){
        this.conn.query(
            `CREATE TABLE IF NOT EXISTS npcs(
                npc_id INT UNIQUE NOT NULL,
                type VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                level TINYINT NOT NULL DEFAULT 0,
                move_speed FLOAT NOT NULL DEFAULT 1,
                health SMALLINT NOT NULL DEFAULT 1,
                mana SMALLINT NOT NULL DEFAULT 1,
                defense_physical TINYINT NOT NULL DEFAULT 0,
                defense_elemental TINYINT NOT NULL DEFAULT 0,
                resistance_physical TINYINT NOT NULL DEFAULT 0,
                resistance_elemental TINYINT NOT NULL DEFAULT 0,
                damage_mult SMALLINT NOT NULL DEFAULT 0,
                crit_mod TINYINT NOT NULL DEFAULT 0,
                crit_mult SMALLINT NOT NULL DEFAULT 0,
                reward_xp INT NOT NULL DEFAULT 0,
                reward_money INT NOT NULL DEFAULT 0,
                reward_tokens iNT NOT NULL DEFAULT 0,
                PRIMARY KEY (npc_id)
            )`,
            err => {if(err) console.log(err.message)}
        );
    }

    createCharactersTable(){
        this.conn.query(
            `CREATE TABLE IF NOT EXISTS characters(
                character_id INT AUTO_INCREMENT UNIQUE NOT NULL,
                account_id INT NOT NULL,
                name VARCHAR(255) UNIQUE NOT NULL,
                level TINYINT NOT NULL DEFAULT 1,
                xp FLOAT NOT NULL DEFAULT 0,
                money INT NOT NULL DEFAULT 0,
                points TINYINT NOT NULL DEFAULT 0, 
                tokens SMALLINT NOT NULL DEFAULT 0,
                skin_id INT NOT NULL DEFAULT 1,
                map_id INT NOT NULL DEFAULT 1,
                spirit_level TINYINT NOT NULL DEFAULT 1,
                affliction_level TINYINT NOT NULL DEFAULT 1,
                destruction_level TINYINT NOT NULL DEFAULT 1,
                weapon_level TINYINT NOT NULL DEFAULT 1,
                PRIMARY KEY (character_id),
                FOREIGN KEY (account_id) REFERENCES accounts(account_id)
                    ON DELETE CASCADE,
                FOREIGN KEY (skin_id) REFERENCES skins(skin_id)
                    ON DELETE RESTRICT,
                FOREIGN KEY (map_id) REFERENCES maps(map_id)
                    ON DELETE RESTRICT 
            )`,
            err => {if(err) console.log(err.message)}
        );
    }

    insertMaps(){
        // {map_id, name, min_level}
        this.conn.query(
            `INSERT INTO maps VALUES(1, 'Titan''s Landing', 1, 100, 100)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO maps VALUES(2, 'Northern Keep', 10, 100, 100)`,
            err => {}
        );/*
        this.conn.query(
            `INSERT INTO maps VALUES(3, 'The Underground', 20, 0, 0)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO maps VALUES(4, 'Lost City', 30, 0, 0)`,
            err => {}
        );*/
        this.conn.query(
            `INSERT INTO maps VALUES(10, 'Graveyard', 1, 100, 100)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO maps VALUES(11, 'Asylum', 6, 100, 100)`,
            err => {}
        );
    }

    insertSkins(){
        // {skin_id, name, level, money, tokens, hp, mp, def_p, def_e, res_p, res_e, dmg_mult, crit_mod, crit_mult}
        this.conn.query(
            `INSERT INTO skins VALUES(1, 'Peasant 1', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(2, 'Peasant 2', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(3, 'Peasant 3', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(4, 'Hunter', 5, 300, 0, 0, 5, 5, 0, 8, 0, 0, 2, 10)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(5, 'Knight', 10, 1000, 0, 5, 5, 8, 4, 10, 5, 0, 3, 12)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(6, 'Ranger', 15, 5000, 0, 10, 10, 10, 6, 12, 7, 5, 4, 15)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(7, 'Templar', 20, 20000, 0, 15, 15, 12, 8, 15, 10, 8, 5, 18)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(8, 'Phantom', 30, 75000, 1, 20, 20, 15, 10, 20, 15, 10, 6, 20)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(9, 'Titan', 40, 200000, 3, 25, 25, 17, 12, 25, 20, 12, 8, 22)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(10, 'Paragon', 50, 999999, 9, 30, 30, 20, 15, 30, 25, 15, 10, 25)`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO skins VALUES(11, 'Incarnate', 50, 9000000, 50, 30, 30, 20, 15, 30, 25, 15, 10, 25)`,
            err => {}
        );
    }

    insertNPCs(){
        // {id, type, name, lvl, speed, health, mana}
        // {def_physical, def_element, res_physical, res_elemental}
        // {dmg_mult, crit_mod, crit_mult}
        // {reward_xp, reward_money, reward_tokens}
        this.conn.query(
            `INSERT INTO npcs VALUES(
                1, 'skeleton', 'Skeleton', 1, 1, 6, 10, 
                0, 0, 0, 0,
                0, 0, 0,
                12, 2, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                2, 'animus', 'Animus', 2, 1, 12, 15, 
                0, 0, 0, 0,
                0, 0, 0,
                20, 6, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                3, 'skeleton-warrior', 'Skeleton Warrior', 3, 1, 20, 20, 
                0, 0, 5, 0,
                0, 0, 0,
                30, 12, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                4, 'aberration', 'Aberration', 4, 1, 30, 30, 
                0, 0, 10, 0,
                0, 0, 0,
                42, 20, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                5, 'necromancer', 'Necromancer', 5, 1, 42, 45, 
                0, 10, 0, 5,
                0, 0, 0,
                56, 30, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                6, 'gargoyle', 'Gargoyle', 6, 1, 56, 60, 
                5, 0, 10, 0,
                0, 0, 0,
                72, 42, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                7, 'grave-knight', 'Grave Knight', 7, 1, 72, 75, 
                5, 5, 15, 10,
                0, 0, 15,
                60, 56, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                8, 'infernal-behemoth', 'Infernal Behemoth', 8, 1, 90, 90, 
                5, 5, 15, 20,
                10, 5, 5,
                90, 72, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                9, 'death-knight', 'Death Knight', 9, 1, 110, 110, 
                5, 5, 20, 15,
                15, 5, 5,
                132, 90, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                10, 'consumed-paragon', 'Consumed Paragon', 10, 1, 156, 160, 
                5, 5, 25, 20,
                15, 5, 10,
                182, 132, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                20, 'fallen-crusader', 'Fallen Crusader', 0, 1, 1260, 1260, 
                5, 5, 25, 25,
                20, 10, 20,
                1000, 900, 0
            )`,
            err => {}
        );
        this.conn.query(
            `INSERT INTO npcs VALUES(
                30, 'meehan', 'Meehan', 0, 1, 200, 200, 
                0, 0, 15, 10,
                10, 10, 5,
                250, 200, 0
            )`,
            err => {}
        );
    }

    createTables(){
        // create each table if they do not exist
        this.createAccountsTable();
        this.createSaltsTable();
        this.createMapsTables();
        this.createNPCsTable();
        this.createSkinsTable();
        this.createCharactersTable();

        // insert any missing data
        this.insertMaps();
        this.insertSkins();
        this.insertNPCs();        
    }
};

module.exports = DatabaseInquisitor;