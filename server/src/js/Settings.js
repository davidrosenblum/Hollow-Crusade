let fs = require("fs");

let Settings = class Settings{
    constructor(json){
        json = (!json) ? {} : json;
        
        for(let opt in Settings.DEFAULT_SETTINGS){
            if(typeof json[opt] === typeof Settings.DEFAULT_SETTINGS[opt]){
                this[opt] = json[opt];
            }
            else{
                this[opt] = Settings.DEFAULT_SETTINGS[opt];
            }
        }
    }

    static load(callback){
        fs.readFile("settings.json", (err, data) => {
            if(!err){
                try{
                    callback(null, JSON.parse(data));
                }
                catch(err){
                    callback(err);
                }
            }
            else{
                callback(err);
            }
        });
    }

    static writeDefault(callback){
        callback = (!callback) ? () => {} : callback;
        fs.writeFile("settings.json", JSON.stringify(Settings.DEFAULT_SETTINGS, null, 4), callback);
    }
};

Settings.DEFAULT_SETTINGS = {
    http_port: 8080,
    tcp_port: 6615,
    udp_port: 6617,
    mysql: {
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "hollow_crusade"
    }
};

module.exports = Settings;