/*
    PortalNode
    node used for teleportation between zones
    basically just holds the ID of where to go 

    (David)
*/

let PortalNode = class PortalNode{
    constructor(gridX, gridY, instanceID, instanceName=null){
        this.gridX = gridY;
        this.gridY = gridY;
        this.instanceID = instanceID;
        this.instanceName = instanceName;
        this.portalID = ++PortalNode.lastPortalID;
    }

    getSpawnData(){
        return {
            portalID: this.portalID,
            gridX: this.gridX,
            gridY: this.gridY,
            instanceID: this.instanceID,
            instanceName: this.instanceName
        };
    }
};
PortalNode.lastPortalID = 0;

module.exports = PortalNode;