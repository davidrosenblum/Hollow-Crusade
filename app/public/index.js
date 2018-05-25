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

    if(process.argv.includes("-test")){
        console.log("(Running test mode)");

        window.loadURL("http://localhost:3000");
    }
    else{
        window.loadURL("./build/index.html");
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