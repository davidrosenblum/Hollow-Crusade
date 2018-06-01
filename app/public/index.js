/*
    Electron main script
*/

let electron = require("electron");

let window = null;

electron.app.on("ready", evt => {
    window = new electron.BrowserWindow({
        title: "Hollow Crusade",
        width: 960,
        height: 540,
        center: true
    });

    let args = parseCommandArgs();

    if(args.includesFlag("test")){
        console.log("(Running test mode)");

        window.loadURL(`http://localhost:3000${args.querystring()}`);
    }
    else{
        window.loadURL(`./build/index.html${args.querystring()}`);
    }

    window.on("closed", evt => {
        window = null;
    });
});

electron.app.on("window-all-closed", evt => {
    if(process.platform !== "darwin"){
        electron.app.quit();
    }
});

let parseCommandArgs = function(){
    let config = {
        _args: {},
        _flags: [],
        getArg(param){
            return this._args[param]
        },

        includesFlag(search){
            return this._flags.includes(search)
        },

        querystring(){
            let qs = "?";
            
            for(let param in this._args){
                qs += `${param}=${this._args[param]}&`
            }
            
            for(let flag of this._flags){
                qs += `${flag}=true&`;
            }

            return (qs.length > 1) ? qs.substring(0, qs.length - 1) : "";
        },

        json(){
            return JSON.stringify({
                flags: this.flags,
                args: this.args
            });
        }
    };

    process.argv.forEach(arg => {
        let a = arg[0],
            b = arg[1] || "";

        if(a === "-" && b !== "-"){
            config._flags.push(arg.substr(1));
        }
        else if(a === "-" && b === "-" && arg.indexOf("=") > 0){
            let split = arg.split("=");
                param = split[0].substr(2),
                argument = split[1];

            config._args[param] = argument;
        }
    });

    return config;
};