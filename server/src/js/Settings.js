/*
    Settings
    holds all the settings used by the server
    can create the default and load/parse using static methods
    
    (David)
*/

// import modules
let fs = require("fs");

let Settings = class Settings{
    constructor(json){
        json = (!json) ? {} : json;
        
        // copy all fields from the defaults, use args if they are the correct type 
        for(let opt in Settings.DEFAULT_SETTINGS){
            if(typeof json[opt] === typeof Settings.DEFAULT_SETTINGS[opt]){
                this[opt] = json[opt];
            }
            else{
                this[opt] = Settings.DEFAULT_SETTINGS[opt];
            }
        }
    }

    // asychnronously loads and parses the settings file
    static load(callback){
        fs.readFile(Settings.FILE_PATH, (err, data) => {
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

    // asychronously writes the default settings file ('settings.json')
    static writeDefault(callback){
        callback = (!callback) ? () => {} : callback;
        fs.writeFile(Settings.FILE_PATH, JSON.stringify(Settings.DEFAULT_SETTINGS, null, 4), callback);
    }
};

// default settings
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

// default file path
Settings.FILE_PATH = "settings.json";

module.exports = Settings;