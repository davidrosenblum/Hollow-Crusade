# Hollow Crusade: Server

Hollow Crusade uses 2 servers, Web and Game servers. Follow the instructions below for how to run the test servers and deploy the live servers.

## Web Server
The Web Server serves the website, provides an interface for account creation, and provides an API layer to the database. 

## Game Server
Provides authentication, game logic, and connections/room management.

## Setup (DEV)
* [MySQL community server](https://dev.mysql.com/downloads/mysql/)
Version 5.7 has been used for testing and development
(remember your user/pass you will need this!)

* [Node.js](https://nodejs.org/en/download/) 
Versions 8.11.2 and up defintely work - not sure about below! 

* Run __npm install__ to download required node.js modules (in both the app/ and server/ folders)

* Run __test\_game.bat__ and __test\_web.bat__ in the __scripts__ folder for testing on Windows.

* Otherwise, __npm run web-test__ and __npm run game-test__ in seperate terminals.

* Modify the __settings.json__ file to change any configurations. 

## Setup (PROD)
* MySQL can be hosted anywhere, like AWS, just setup the connection details in the settings.json file.

* Install node.js on the server.

*  Run _npm install_ on the server.

*  Run _ npm start_  on the server.

## Configuration
This will all be in the __settings.json__ file.
Please note, this file does not initially exist and will be created when either server is launched.
``` javascript
{
    "http_port": 80,
    "tcp_port": 6615,
    "udp_port": 6617,
    "mysql": {
        "host": "127.0.0.1",
        "user": "root",
        "password": "",
        "database": "hollow_crusade"
    }
}
```