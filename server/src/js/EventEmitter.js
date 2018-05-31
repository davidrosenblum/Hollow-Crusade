/*
    EventEmitter
    stores and triggers events by 'event type' to implement event-driven design
    (see 'GameEvent.js' for expected event types - not required to use that tho) 

    (David)
*/

let EventEmitter = class EventEmitter{
    constructor(){
        this._eventListeners = {};
    }

    // subscribes to an event type with a listener
    on(eventType, listener){
        if(!this.willTrigger(eventType)){
            this._eventListeners[eventType] = [];
        }
        this._eventListeners[eventType].push(listener);
    }

    // triggers all subscribing listeners
    emit(event){
        event.emitter = this;
        if(this.willTrigger(event.type)){
            for(let listener of this._eventListeners[event.type]){
                listener(event);
            }
        }
    }

    // re-emits the event, preserves the original emitter (used for bubbling, but many objects here dont have 'parents')
    bubble(event){
        if(!event.emitter){
            throw new Error("Event had not emitter, use 'emit' then 'bubble' when re-emitting (such as with nested event emitters).");
        }

        event.bubbler = this;
        if(this.willTrigger(event.type)){
            for(let listener of this._eventListeners[event.type]){
                listener(event);
            }
        }
    }

    // destroys all listeners
    clearListeners(){
        this._eventListeners = {};
    }

    // destroys all listeners for a given event type 
    removeListeners(eventType){
        delete this._eventListeners[eventType];
    }

    // removes a specific listener for the specified event type
    removeListener(eventType, listener){
        if(this.willTrigger(eventType)){
            for(let i = 0, fn; i < this._eventListeners[eventType].length; i++){
                fn = this._eventListeners[eventType][i];

                if(fn === listener){
                    this._eventListeners[eventType].splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    // checks if an event type is currently subscribed
    willTrigger(eventType){
        return eventType in this._eventListeners;
    }
};

module.exports = EventEmitter;