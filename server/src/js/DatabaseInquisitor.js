const HASH_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(""),
    SALT_SIZE = 128;

let DatabaseInquisitor = class DatabaseInquisitor{
    constructor(mysqlConn){
        this.conn = mysqlConn;
        this.createTables();
    }

    hash(str, salt){
        let input = str + (salt || ""),
            output = "";

        for(let i = 0, cc; i < input.length; i++){
            cc = input.charCodeAt(i) * 2 + i;

            output += HASH_CHARS[cc % HASH_CHARS.length]
        }

        return output;
    }

    generateSalt(initStr){
        let size = SALT_SIZE - (initStr ? initStr.length : 0),
            salt = "";

        if(size < 1){
            return "";
        }

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
            `SELECT name, level, skin_id FROM characters
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

    loadSkins(callback){
        this.conn.query(
            "SELECT * FROM skins",
            callback
        );
    }

    createTables(){
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
            err => {
                if(!err){

                }
            }
        );

        this.conn.query(
            `CREATE TABLE skins(
                skin_id INT UNIQUE NOT NULL,
                name VARCHAR(255) UNIQUE NOT NULL,
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
            err => {
                if(!err){
                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money)
                        VALUES(
                            1, 'Peasant 1', 0
                        )`
                    );

                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money)
                        VALUES(
                            2, 'Peasant 2', 0
                        )`
                    );

                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money)
                        VALUES(
                            3, 'Peasant 3', 0
                        )`
                    );

                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money, mana, defense_physical, resistance_physical, critical_chance, critical_mult)
                        VALUES(
                            4, 'Hunter', 500, 5, 5, 8, 2, 10
                        )`
                    );

                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money, health, defense_physical, defense_elemental, resistance_physical, resistance_elemental)
                        VALUES(
                            5, 'Knight', 1000, 15, 8, 3, 10, 8
                        )`
                    );

                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money, mana, defense_physical, defense_elemental, resistance_physical, resistance_elemental, critical_chance, critical_mult, damage_mult)
                        VALUES(
                            6, 'Ranger', 5000, 10, 10, 10, 8, 6, 4, 15, 5
                        )`
                    );

                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money, health, mana, defense_physical, defense_elemental, resistance_physical, resistance_elemental)
                        VALUES(
                            7, 'Templar', 7000, 20, 5, 10, 5, 15, 10
                        )`
                    );

                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money, tokens, health, mana, defense_physical, defense_elemental, resistance_physical, resistance_elemental, critical_chance, critical_mult, damage_mult)
                        VALUES(
                            8, 'Phantom', 15000, 3, 15, 15, 12, 12, 15, 10, 5, 20, 10
                        )`
                    );

                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money, tokens, health, mana, defense_physical, defense_elemental, resistance_physical, resistance_elemental, critical_chance, critical_mult, damage_mult)
                        VALUES(
                            9, 'Titan', 20000, 3, 25, 10, 12, 10, 20, 15, 2, 10, 5
                        )`
                    );

                    this.conn.query(
                        `INSERT INTO skins(skin_id, name, money, tokens, health, mana, defense_physical, defense_elemental, resistance_physical, resistance_elemental, critical_chance, critical_mult, damage_mult)
                        VALUES(
                            10, 'Death Knight', 99999, 9, 35, 20, 15, 15, 25, 20, 10, 30, 20
                        )`
                    );
                }
            }
        );

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
                spirit_level TINYINT NOT NULL DEFAULT 1,
                affliction_level TINYINT NOT NULL DEFAULT 1,
                destruction_level TINYINT NOT NULL DEFAULT 1,
                weapon_level TINYINT NOT NULL DEFAULT 1,
                PRIMARY KEY (character_id),
                FOREIGN KEY (account_id) REFERENCES accounts(account_id)
                    ON DELETE CASCADE,
                FOREIGN KEY (skin_id) REFERENCES skins(skin_id)
                    ON DELETE RESTRICT
            )`
        );

        this.conn.query(
            `CREATE TABLE IF NOT EXISTS salts(
                account_id INT UNIQUE NOT NULL,
                salt VARCHAR(255) NOT NULL,
                PRIMARY KEY(account_id, salt),
                FOREIGN KEY (account_id) REFERENCES accounts(account_id)
                    ON DELETE CASCADE
            )`
        );
    }
};

module.exports = DatabaseInquisitor;