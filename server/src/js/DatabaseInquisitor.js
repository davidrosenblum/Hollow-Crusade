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

    createCharacter(username, name, skinID=1){
        this.conn.query(
            `INSERT INTO characters(account_id, name, skin_id)
            VALUES(
                (
                    SELECT account_id FROM accounts
                    WHERE username = '${username}'
                ),
                '${name}',
                ${skin_id}
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
            if(typeof data[k] === "string"){
                set += `${k} = '${data[k]}, `;
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
            )`
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
                    ON DELETE CASCADE
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