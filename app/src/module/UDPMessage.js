let UDPMessage = class UDPMessage{
    constructor(socketID, objectID, x, y, anim){
        this.socketID = socketID;
        this.objectID = objectID;
        this.x = x;
        this.y = y;
        this.anim = anim;
    }

    toString(){
        return `${this.socketID},${this.objectID},${this.x},${this.y},${this.anim}`;
    }

    static parse(message){
        let msg = message.toString().split(",");

        if(msg.length !== 5){
            throw new Error("Invalid UDP message.");
        }

        return new UDPMessage(
            msg[0],
            msg[1],
            parseFloat(msg[2]) || null,
            parseFloat(msg[3]) || null,
            msg[4],
        );
    }
};

export default UDPMessage;