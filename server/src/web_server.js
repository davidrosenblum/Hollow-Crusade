let express = require("express"),
    mysql = require("mysql");

let DatabaseInquisitor = require("./js/DatabaseInquisitor"),
    Settings = require("./js/Settings");

const VERSION  = "0.1.0";

let app = express().use(express.static(`${__dirname}/../public_html/`)),
    listener = null,
    database = null;

app.route("/").get((req, res) => {
    res.sendFile("index.html");
});

app.route("/hash/*").get((req, res) => {
    let val = req.url.split("/").pop();

    res.end(`${val} = ${database.hash(val)}`);
});

app.route("/api/accounts/create/*").post((req, res) => {
    let split = req.url.split("/"),
        password = split.pop(),
        username = split.pop();

    database.createAccount(username, password, err => {
        if(err){
            if(err.errno === 1062){
                res.writeHead(400);
                res.end(`Username "${username}" is unavailable.`);
            }
            else{
                console.log(err.message);
                res.writeHead(500);
                res.end("Server error.");
            }
        }
        else{
           res.end(`Account "${username}" created.`); 
        }
    });
});

app.route("/api/accounts/password/set/*").post((req, res) => {
    
});

let connectDB = function(config, callback){
    let dbConn = mysql.createConnection(config || {});

    dbConn.connect(err => {
        if(!err){
            database = new DatabaseInquisitor(dbConn);
            callback();
        }
        else{
            callback(err);
        }
    });
};

let init = function(){
    console.log("Loading settings...");
    let settings = null;

    Settings.load((err, data) => {
        if(err){
            if(err.errno && err.errno === -4058){
                console.log("Writing and using default settings.");
                Settings.writeDefault();

                settings = new Settings();
            }
            else{
                console.log(err.message);
                process.exit();
            }
        }
        else{
            console.log("Settings loaded.");
            settings = new Settings(data);
        }

        console.log("\nConnecting to MySQL database...");
        connectDB(settings.mysql, err => {
            if(err){
                console.log(err.message);
                process.exit();
            }
            else{
                console.log("MySQL database connected.\n");

                listener = app.listen(settings.http_port, err => {
                    if(!err){
                        console.log(`HTTP server opened on port ${listener.address().port}.`);
                    }
                });
            }
        });
    });
};

console.log("  ______________________");
console.log(" /\t\t\t\\");
console.log("|     Hollow Crusade\t |");
console.log(`|   Web Server v${VERSION}\t |`);
console.log(" \\______________________/\n");
init();