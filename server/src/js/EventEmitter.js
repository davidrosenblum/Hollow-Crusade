let EventEmitter = class EventEmitter{
    constructor(){
        this._eventListeners = {};
    }

    on(eventType, listener){
        if(!this.willTrigger(eventType)){
            this._eventListeners[eventType] = [];
        }
        this._eventListeners[eventType].push(listener);
    }

    emit(event){
        event.emitter = this;
        if(this.willTrigger(event.type)){
            for(let listener of this._eventListeners[event.type]){
                listener(event);
            }
        }
    }

    clearListeners(){
        this._eventListeners = {};
    }

    removeListeners(eventType){
        delete this._eventListeners[eventType];
    }

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

    willTrigger(eventType){
        return eventType in this._eventListeners;
    }
};

module.exports = EventEmitter;