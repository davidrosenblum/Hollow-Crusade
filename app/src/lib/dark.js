let dark = (function(){
    const VERSION = "1.0.0";
    
    let lastDisplayObjectID = 0,
        initialized = false;

    let Event = class Event{
        constructor(type, target, value){
            if(arguments.length === 1 && typeof arguments[0] === "object"){
                let opts = arguments[0];

                this.type = (typeof opts.type === "string") ? opts.type : "NO_TYPE";
                this.target = (typeof opts.target !== "undefined") ? opts.target : null;
                this.value = (typeof opts.value !== "undefined") ? opts.value : null;
            }
            else{
                this.type = type;
                this.target = target;
                this.value = value;
            }
        }
    };
    Event.ADD = "add";
    Event.CHILD_ADD = "child-add";
    Event.CHILD_REMOVE = "child-remove";
    Event.CLICK = "click";
    Event.DRAW = "draw";
    Event.MOVE = "move";
    Event.REMOVE = "remove";
    Event.RESIZE = "resize"

    let EventEmitter = class EventEmitter{
        constructor(){
            this._eventListeners = {};
        }

        emit(event){
            event.emitter = this;

            if(this.willTrigger(event.type)){
                for(let fn of this._eventListeners[event.type]){
                    fn(event);
                }
            }
        }

        on(eventType, listener){
            if(!this.willTrigger(eventType)){
                this._eventListeners[eventType] = [];
            }

            this._eventListeners[eventType].push(listener);
        }

        addListener(eventType, listener){
            this.on(eventType, listener);
        }

        prependListener(eventType, listener){
            if(!this.willTrigger(eventType)){
                this._eventListeners[eventType] = [];
            }

            this._eventListeners = [listener].concat(this._eventListeners);
        }

        removeListener(eventType, listener){
            if(this.willTrigger(eventType)){
                let listeners = this._eventListeners[eventType];

                for(let i = 0; i < listeners.length; i++){
                    if(listeners[i] === listener){
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        }

        removeListeners(eventType){
            delete this._eventListeners[eventType];
        }

        removeAllListeners(){
            this._eventListeners = {};
        }

        willTrigger(eventType){
            return eventType in this._eventListeners;
        }
    };
    
    let DisplayObject = class DisplayObject extends EventEmitter{
        constructor(x=0, y=0, width=0, height=0){
            super();

            this._x = x;
            this._y = y;
            this._width = width;
            this._height = height;

            this._drawXCache = x;
            this._drawYCache = y;

            this.visible = true;
            this.showHitbox = false;

            this._hitbox = null;
            this._id = ++lastDisplayObjectID;
            this._parent = null;
        }

        hitboxCollision(target, forceIgnoreHitbox=false){
            if(target instanceof DisplayObject === false){
                throw new Error("Argument must be of type DisplayObject.");
                return;
            }

            let hb1 = this.hitbox,
                hb2 = target.hitbox;

            if(forceIgnoreHitbox){
                hb1 = this;
                hb2 = target;
            }

            if(hb1.drawY < hb2.drawBottom && hb2.drawY < hb1.drawBottom){
                if(hb1.drawX < hb2.drawRight && hb2.drawX < hb1.drawRight){
                    return true;
                }
            }
            return false;
        }

        hitboxCollisions(array){
            for(let object of array){
                if(this.hitboxCollision(object)){
                    return object;
                }
            }
            return null;
        }

        draw(){
            if(this.visible){
                this.emit(new Event(Event.DRAW));

                if(this.showHitbox){
                    this.drawHitbox();
                }
            }
        }

        drawHitbox(){
            CTX.strokeRect(this.hitbox.drawX, this.hitbox.drawY, this.hitbox.width, this.hitbox.height);
        }

        remove(){
            if(this._parent){
                return this._parent.removeChild(this) !== null;
            }
            return false;
        }

        center(){
            if(this._parent){
                this.x = (this._parent.width - this.width) / 2;
                this.y = (this._parent.height - this.height) / 2;
            }
        }

        centerTD(){
            if(this._parent){
                this.x = (this._parent.width - this.width) / 2;
                this.y = this._parent.height - this.height;
            } 
        }

        setPosition(x, y){
            this._x = x;
            this._y = y;

            this.updateDrawXCache();
            this.updateDrawYCache();
            
            this.emit(new Event(Event.MOVE));
        }

        setSize(width, height){
            this._width = width;
            this._height = height;

            this.emit(new Event(Event.RESIZE));
        }

        updateDrawXCache(){
            this._drawXCache = this._x;

            let cursor = this._parent;
            while(cursor){
                this._drawXCache += cursor.x;
                cursor = cursor._parent;
            }
        }

        updateDrawYCache(){
            this._drawYCache = this._y;

            let cursor = this._parent;
            while(cursor){
                this._drawYCache += cursor.y;
                cursor = cursor._parent;
            }
        }

        set x(x){
            this._x = x;

            this.updateDrawXCache();

            this.emit(new Event(Event.MOVE));   
        }

        set y(y){
            this._y = y;

            this.updateDrawYCache();

            this.emit(new Event(Event.MOVE));
        }

        set width(width){
            this._width = width;

            if(this.hitbox !== this){
                this.hitbox.centerTD();
            }

            this.emit(new Event(Event.RESIZE));
        }

        set height(height){
            this._height = height;

            if(this.hitbox !== this){
                this.hitbox.centerTD();
            }

            this.emit(new Event(Event.RESIZE));
        }

        get hitbox(){
            return this;
        }

        get x(){
            return this._x;
        }

        get y(){
            return this._y;
        }

        get width(){
            return this._width;
        }

        get height(){
            return this._height;
        }

        get right(){
            return this.x + this.width;
        }

        get bottom(){
            return this.y + this.height;
        }

        get centerX(){
            return this.x + this.width / 2;
        }

        get centerY(){
            return this.y + this.height / 2;
        }

        get drawX(){
            return this._drawXCache;
        }

        get drawY(){
            return this._drawYCache;
        }

        get drawRight(){
            return this.drawX + this.width;
        }

        get drawBottom(){
            return this.drawY + this.height;
        }

        get drawCenterX(){
            return this.drawX + this.drawWidth / 2;
        }

        get drawCenterY(){
            return this.drawY + this.drawHeight / 2;
        }

        get parent(){
            return this._parent;
        }
    };

    let DisplayObjectContainer = class DisplayObjectContainer extends DisplayObject{
        constructor(x=0, y=0, width=0, height=0){
            super(x, y, width, height);

            this._drawList = [];
            this._children = {};
        }

        draw(){
            if(this.visible){
                this.emit(new Event(Event.DRAW));
                this.drawChildren();

                if(this.showHitbox){
                    this.drawHitbox();
                }
            }
        }

        drawChildren(){
            for(let child of this._drawList){
                child.draw();
            }
        }

        addChild(object){
            if(object instanceof DisplayObject){
                if(!this.containsChild(object)){
                    if(object.parent){
                        object.parent.removeChild(object);
                    }

                    object._parent = this;
                    this._drawList.push(object);
                    this._children[object._id] = object;

                    this.emit(new Event(Event.CHILD_ADD, object));
                    this.emit(new Event(Event.ADD, this));

                    return true;
                }
                return false;
            }
            else throw new Error("Argument must be of type DisplayObject.");
        }

        addChildAt(object, index){
            if(object instanceof DisplayObject){
                if(!this.containsChild(object)){
                    if(object.parent){
                        object.parent.removeChild(object);
                    }
                    
                    let list = [];

                    for(let i = 0; i < this.numChildren; i++){
                        if(i === index){
                            list.push(object);
                        }
                        list.push(this.getChildAt(i));
                    }

                    object._parent = this;
                    this._drawList.push(object);
                    this._children[object._id] = object;

                    this.emit(new Event(Event.CHILD_ADD, object));
                    this.emit(new Event(Event.ADD, this));

                    this._drawList = list;
                    return true;
                }
                return false;
            }
            else throw new Error("Argument must be of type DisplayObject.");
        }

        addChildren(array){
            for(let object of array){
                this.addChild(object);
            }
        }

        removeChild(target){
            return this.removeChildAt(this.findChildIndex(target));
        }

        removeChildAt(index){
            console.log(index);
            if(index >= 0 && index < this.numChildren){
                let child = this.getChildAt(index);

                child._parent = null;
                this._drawList.splice(index, 1);
                delete this._children[child._id];

                this.emit(new Event(Event.CHILD_REMOVE, child));
                this.emit(new Event(Event.REMOVE, this));

                return child;
            }
            else console.warn(index);
        }

        removeChildren(array){
            if(!array){
                for(let i = 0; i < this.numChildren; i++){
                    let child = this.getChildAt(i);
                    child._parent = null;
                    
                    this.emit(new Event(Event.CHILD_REMOVE, child));
                    this.emit(new Event(Event.REMOVE, this));
                }

                this._drawList = [];
                this._children = {};
            }

            else{
                for(let object of array){
                    this.removeChild(object);
                }
            }
        }

        findChildIndex(target){
            if(target instanceof DisplayObject){
                for(let i = 0; i < this.numChildren; i++){
                    if(this.getChildAt(i) === target){
                        return i;
                    }
                }
                return -1;
            }
            else throw new Error("Argument must be of type DisplayObject.");
        }

        containsChild(target){
            if(target instanceof DisplayObject){
                return target._id in this._children;
            }
            else throw new Error("Argument must be of type DisplayObject.");
        }

        forEachChild(fn){
            for(let i = 0; i < this.numChildren; i++){
                fn(this.getChildAt(i), i);
            }
        }

        forAllChildren(fn){
            for(let i = 0; i < this.numChildren; i++){
                let child = this.getChildAt(i);

                fn(child, i);

                if(child instanceof DisplayObjectContainer){
                    child.forAllChildren(fn);
                }
            }
        }

        swapChildrenAt(index1, index2){
            let a = this.getChildAt(index1),
                b = this.getChildAt(index2);

            if(a && b){
                this._drawList[index1] = b;
                this._drawList[index2] = a;
                return true;
            }
            return false;
        }

        swapChildren(a, b){
            let index1 = -1,
                index2 = -1;

            for(let i = 0; i < this.numChildren; i++){
                if(this.getChildAt(i) === a){
                    index1 = i;
                }
                else if(this.getChildAt(i) === b){
                    index2 = i;
                }

                if(index1 > -1 && index2 > -1){
                    break;
                }
            }

            if(index1 > -1 && index2 > -1){
                this._drawList[index1] = b;
                this._drawList[index2] = a;
                return true;
            }
            return false;
        }

        depthSort(){
            for(let i = 0, a; i < this.numChildren; i++){
                a = this.getChildAt(i);

                for(let j = i + 1, b; j < this.numChildren; j++){
                    b = this.getChildAt(j);

                    if(a.bottom > b.bottom){
                        this._drawList[i] = b;
                        this._drawList[j] = a;
                        a = b;
                    }
                }
            }
        }

        setHitbox(width, height){
            this.removeHitbox();
            this._hitbox = new DisplayObject(0, 0, width, height);
            this.addChild(this._hitbox);
            this._hitbox.centerTD();
        }

        removeHitbox(){
            if(this._hitbox){
                this.removeChild(this._hitbox);
            }
            this._hitbox = null;
        }

        get hitbox(){
            return this._hitbox ? this._hitbox : this;
        }

        updateDrawXCache(){
            super.updateDrawXCache();
            this.forAllChildren(child => child.updateDrawXCache());
        }

        updateDrawYCache(){
            super.updateDrawYCache();
            this.forAllChildren(child => child.updateDrawYCache());
        }

        getChildAt(index){
            return this._drawList[index] || null;
        }

        get numChildren(){
            return this._drawList.length;
        }
    };

    let TextField = class TextField extends DisplayObject{
        constructor(text=null, x=0, y=0){
            super(x, y);

            this.text = text;
            this.maxWidth = undefined;
            this.font = TextField.DEFAULT_FONT;
            this.fillStyle = "white";
            this.strokeStyle = "black";
        }

        draw(){
            if(this.visible){
                CTX.save(); 
                CTX.fillStyle = this.fillStyle;
                CTX.strokeStyle = this.strokeStyle;
                CTX.font = this.font;

                CTX.strokeText(this.text, this.drawX, this.drawY, this.maxWidth);
                CTX.fillText(this.text, this.drawX, this.drawY, this.maxWidth);

                CTX.restore();
            }
        }

        centerText(){
            if(this._parent){
                this.x = (this._parent.width - this.width) / 2;
            }
        }

        get width(){
            return CTX.measureText(this.text).width;
        }

        get height(){
            return parseFloat(this.font);
        }
    };
    TextField.DEFAULT_FONT = "12px calibri";

    let Sprite = class Sprite extends DisplayObjectContainer{
        constructor(image=null, x=0, y=0, width=0, height=0){
            super(x, y, width, height);

            this._image = Sprite.EMPTY_IMAGE;

            if(typeof image === "string"){
                AssetManager.loadImage(image, (err, img) => {
                    if(!err){
                        this._image = img;
                    }
                });
            }
            else throw new Error("Image argument must be of type String.");
        }

        draw(){
            if(this.visible){
                this.emit(new Event(Event.DRAW));
                this.drawChildren();

                CTX.drawImage(
                    this._image,
                    this.drawX,
                    this.drawY,
                    this.width,
                    this.height
                ); 

                if(this.showHitbox){
                    this.drawHitbox();
                }
            }
        }

        changeImage(url){
            this._image = Sprite.EMPTY_IMAGE;

            AssetManager.loadImage(url, (err, img) => {
                if(!err){
                    this._image = img;
                }
            });
        }

        get image(){
            return this._image;
        }
    };
    Sprite.EMPTY_IMAGE = document.createElement("img");

    let AnimatedSprite = class AnimatedSprite extends Sprite{
        constructor(image=null, x=0, y=0, width=0, height=0){
            super(image, x, y, width, height);

            this._currAnim = null;
            this._currFrame = 0;
            this._animations = {};
            this._animEnabled = true;
        }

        draw(){
            if(this.visible){
                this.emit(new Event(Event.DRAW));
                this.drawChildren();

                if(this._animEnabled && this._currAnim){
                    CTX.drawImage(
                        this._image,
                        this.currAnimFrame.clipX,
                        this.currAnimFrame.clipY,
                        this.currAnimFrame.clipWidth,
                        this.currAnimFrame.clipHeight,
                        this.drawX,
                        this.drawY,
                        this.width,
                        this.height
                    )
                }
                else{
                    CTX.drawImage(
                        this._image,
                        this.drawX,
                        this.drawY,
                        this.width,
                        this.height
                    ); 
                }

                if(this.showHitbox){
                    this.drawHitbox();
                }
            }
        }

        nextFrame(){
            this._currFrame++;

            if(this._currFrame >= this.currFrameCount){
                this._currFrame = 0;
            }
        }

        prevFrame(){
            this._currFrame--;

            if(this._currFrame < 0){
                this._currFrame = this.currFrameCount - 1;
            }
        }

        gotoAndPlay(frame){
            this._currFrame = frame;
            this._animEnabled = true;
        }

        gotoAndStop(frame){
            this._currFrame = frame;
            this._animEnabled = false;
        }

        playAnimation(name){
            if(name in this._animations && this._currAnim !== name){
                this._currAnim = name;
                this._currFrame = 0;
            }
        }

        setAnimation(name, frames){
            this._animations[name] = [];

            for(let frame of frames){
                this._animations[name].push(frame);
            }
        }

        get currFrame(){
            return this._currFrame;
        }

        get currAnim(){
            return this._currAnim;
        }

        get currAnimFrame(){
            if(this._currAnim){
                return this._currAnim[this._currFrame];
            }
            return null;
        }

        get currFrameCount(){
            return (this._animations[this.currAnim] || []).length;
        }
    };

    let Bounds = class Bounds{
        constructor(x=0, y=0, width=0, height=0){
            this._x = x;
            this._y = y;
            this._width = width;
            this._height = height;
            this._right = x + width;
            this._bottom = y + height;
            this._centerX = x + (width/2);
            this._centerY = y + (height/2);
        }

        set x(x){
            this._x = x;
            this._right = this.x + this.width;
            this._centerX = this.x + this.width/2;
        }

        set y(y){
            this._y = y;
            this._bottom = this.y + this.height;
            this._centerY = this.y + this.height/2;
        }

        set width(width){
            this._width = width;
            this._right = this.x + width;
            this._centerX = this.x + width/2;
        }

        set height(height){
            this._height = height;
            this._bottom = this.y + height;
            this._centerY = this.y + height/2;
        }

        get x(){
            return this._x;
        }

        get y(){
            return this._y;
        }

        get width(){
            return this._width;
        }

        get height(){
            return this._height;
        }

        get right(){
            return this._right;
        }

        get bottom(){
            return this._bottom;
        }

        get centerX(){
            return this._centerX;
        }

        get centerY(){
            return this._centerY;
        }
    };

    let KeyHandler = class KeyHandler{
        constructor(element){
            this._keys = {};
            this._numKeys = 0;

            element.addEventListener("keyup", evt => this.forceKeyUp(evt.keyCode));
            element.addEventListener("keydown", evt => this.forceKeyDown(evt.keyCode));
        }

        forceKeyUp(keyCode){
            if(this.isKeyDown(keyCode)){
                delete this._keys[keyCode];
                this._numKeys--;    
            }
        }

        forceKeyDown(keyCode){
            if(this.isKeyUp(keyCode)){
                this._keys[keyCode] = true;
                this._numKeys++;    
            }
        }

        isKeyUp(keyCode){
            return !(keyCode in this._keys);
        }

        isKeyDown(keyCode){
            return keyCode in this._keys;
        }

        allKeysUp(keyCodes){
            for(let kc in keyCodes){
                if(this.isKeyDown(kc)){
                    return false;
                }
            }
            return true;
        }

        allKeysDown(keyCodes){
            for(let kc in keyCodes){
                if(this.isKeyUp(kc)){
                    return false;
                }
            }
            return true;
        }

        anyKeysUp(keyCodes){
            for(let kc in keyCodes){
                if(this.isKeyUp(kc)){
                    return true;
                }
            }
            return false;
        }

        anyKeysDown(keyCodes){
            for(let kc in keyCodes){
                if(this.isKeyDown(kc)){
                    return true;
                }
            }
            return false;
        }

        get numKeys(){
            return this._numKeys;
        }
    };

    let Scroller = class Scroller{
        constructor(scenes, bounds){
            this._scroll = new Bounds(0, 0, stage.canvas.width, stage.canvas.height);
            this._bounds = new Bounds(bounds.x, bounds.y, bounds.width, bounds.height);

            this._scenes = [];
            for(let s of scenes){
                if(s instanceof DisplayObjectContainer){
                    this._scenes.push(s);
                }
            }
        }

        update(){
            for(let scene of this._scenes){
                scene.x = -this._scroll.x;
                scene.y = -this._scroll.y;
            }
        }

        scrollXWith(target, distance){
            if(target.centerX <= this._scroll.centerX){
                if(distance < 0){
                    this.scrollX(distance);
                }
            }
            else{
                if(distance > 0){
                    this.scrollX(distance);
                }
            }
        }

        scrollYWith(target, distance){
            if(target.centerY <= this._scroll.centerY){
                if(distance < 0){
                    this.scrollY(distance);
                }
            }
            else{
                if(distance > 0){
                    this.scrollY(distance);
                }
            }
        }

        scrollX(distance){
            let offset = this._scroll.x + distance;
            if(offset >= this._bounds.x && offset + this._scroll.width <= this._bounds.right){
                this._scroll.x = offset;
                this.update();
                return true;
            }
            return false;
        }

        scrollY(distance){
            let offset = this._scroll.y + distance;
            if(offset >= this._bounds.y && offset + this._scroll.height <= this._bounds.bottom){
                this._scroll.y = offset;
                this.update();
                return true;
            }
            return false;
        }

        scrollXIgnoreBounds(distance){
            this._scroll.x += distance;
            this.update();
        }

        scrollYIgnoreBounds(distance){
            this._scroll.y += distance;
            this.update();
        }

        get offsetX(){
            return this._scroll.x;
        }

        get offsetY(){
            return this._scroll.y;
        }
    };

    let RNG = class RNG{
        static nextInt(min=0, max=10){
            return Math.trunc(Math.random() * (max - min) + min);
        }

        static nextNum(min=0, max=1){
            return Math.random() * (max - min) + min;
        }
    };   

    let CollisionGrid = class CollisionGrid{
        constructor(rows, cols, cellSize){
            this._cellSize = cellSize;
            this._grid = [];
            this._numObjects = 0;

            for(let y = 0; y < cols; y++){
                this._grid.push(new Array(rows));
            }
        }

        storeAt(object, x, y){
            if(!this.retrieveAt(x, y)){
                this._grid[y][x] = object;
                this._numObjects++;
            }
        
        }

        retrieveAt(x, y){
            if(y < this._grid.length && y >= 0){
                if(x < this._grid[y].length && x >= 0){
                    return this._grid[y][x] || null;
                }
            }
            return null;
        }

        getCoords(target){
            return {
                x: (target.hitbox !== target) ? Math.floor((target.x + target.hitbox.centerX) / this._cellSize) : Math.floor(target.centerX / this._cellSize),
                y: (target.hitbox !== target) ? Math.floor((target.y + target.hitbox.centerY) / this._cellSize) : Math.floor(target.centerY / this._cellSize)
            };
        }

        getSurrounding(target){
            let coords = this.getCoords(target);

            return {
                topLeft:        this.retrieveAt(coords.x-1, coords.y-1),
                topCenter:      this.retrieveAt(coords.x, coords.y-1),
                topRight:       this.retrieveAt(coords.x+1, coords.y-1),
                centerLeft:     this.retrieveAt(coords.x-1, coords.y),
                center:         this.retrieveAt(coords.x, coords.y),
                centerRight:    this.retrieveAt(coords.x+1, coords.y),
                bottomLeft:     this.retrieveAt(coords.x-1, coords.y+1),
                bottomCenter:   this.retrieveAt(coords.x, coords.y+1),
                bottomRight:    this.retrieveAt(coords.x+1, coords.y+1),
            };
        }

        collisionAbove(target){
            if(target instanceof DisplayObject){
                let x = Math.round(target.x / this._cellSize),
                    y = Math.round(target.y / this._cellSize);

                return this.retrieveAt(x, y) || null;
            }
        }

        collisionBelow(target){
            if(target instanceof DisplayObject){
                let x = Math.round(target.x / this._cellSize),
                    y = Math.round(target.bottom / this._cellSize);
                    
                return this.retrieveAt(x, y) || null;
            }
        }

        collisionLeft(target){
            if(target instanceof DisplayObject){
                let x = Math.ceil(target.x / this._cellSize) - 1,
                    y = Math.round(target.centerY / this._cellSize);

                return this.retrieveAt(x, y) || null;
            }
        }

        collisionRight(target){
            if(target instanceof DisplayObject){
                let x = Math.ceil(target.right / this._cellSize) - 1,
                    y = Math.round(target.centerY / this._cellSize);

                return this.retrieveAt(x, y) || null;
            }

            let surrounding = this.getSurrounding(target);
            if(surrounding.center) return surrounding.center;
            else if(surrounding.bottomRight) return surrounding.bottomRight;
        }

        convertPixelsToCoords(px, py){
            return {
                x: Math.round(px / this._cellSize),
                y: Math.round(py / this._cellSize)
            };
        }

        get numObjects(){
            return this._numObjects;
        }
    };

    let MapBuilder = class MapBuilder{
        static buildGrid(matrix, tileTypes, cellSize, container=null, buildCollisionGrid=false){
            let cd = (buildCollisionGrid) ? new CollisionGrid(matrix[0].length, matrix.length, cellSize) : null;

            for(let y = 0; y < matrix.length; y++){
                for(let x = 0; x < matrix[y].length; x++){
                    let index = matrix[y][x],
                        type = tileTypes[index] || null;

                    if(type){
                        let tile = new type();
    
                        tile.x = x * cellSize;
                        tile.y = y * cellSize;

                        if(tile.height > cellSize){
                            tile.y -= (tile.height - cellSize);
                        }

                        if(container){
                            container.addChild(tile);
                        }

                        if(buildCollisionGrid){
                            cd.storeAt(tile, x, y);
                        }   
                    }
                }
            }

            return cd;
        }
    };

    let ObjectManager = class ObjectManager{
        constructor(){
            this._objects = {};
            this._numObjects = 0;
        }

        addObject(object){
            if(object instanceof GameObject){
                if(!this.containsObject(object)){
                    this._objects[object.objectID] = object;
                    this._numObjects++;
                    return true;
                }
                return false;
            }
            else throw new Error("Argument must be of type GameObject.");
        }

        removeObject(id){
            let object = this.getObject(id);
            if(object){
                delete this._numObjects[id];
                this._numObjects--;
                return object;
            }
            return null;
        }

        updateObject(data){
            let object = this.getObject(data.objectID || -1);
            if(object){
                object.applyUpdate(data);
                return true;
            }
            return false;
        }

        containsObject(object){
            return (object.objectID || -1) in this._objects;
        }

        containsObjectID(id){
            return id in this._objects;
        }

        clearObjects(){
            this._objects = {};
            this._numObjects = 0;
        }

        getObject(id){
            return this._objects[id] || null;
        }

        get numObjects(){
            return this._numObjects;
        }
    };

    let SoundManager = class SoundManager{
        static playSound(url){
            if(url in SoundManager.IGNORE_SOUNDS === false){
                AssetManager.loadAudio(url, (err, audio) => {
                    audio.play();

                    SoundManager.IGNORE_SOUNDS[url] = true;
                    setTimeout(() => {
                        delete SoundManager.IGNORE_SOUNDS[url];
                    }, 500);
                });
            }
        }
    };
    SoundManager.EMPTY_SOUND = document.createElement("audio");
    SoundManager.IGNORE_SOUNDS = {};

    let AssetManager = class AssetManager{
        static loadImage(url, done, keyOverride){
            let key = (typeof keyOverride === "string") ? keyOverride : url;

            if(key in AssetManager.IMAGE_CACHE){
                if(typeof done === "function"){
                    done(null, AssetManager.IMAGE_CACHE[key]);
                }

                return AssetManager.IMAGE_CACHE[key];
            }

            let img = document.createElement("img");
            
            img.addEventListener("load", evt => {
                AssetManager.IMAGE_CACHE[key] = img;
                
                if(typeof done === "function"){
                    done(null, img);
                }
            });

            img.addEventListener("error", evt => {
                AssetManager.IMAGE_CACHE[key] = Sprite.EMPTY_IMAGE;

                if(typeof done === "function"){
                    done(evt, null);
                }
            });

            img.setAttribute("src", url);

            return img;

        }

        static loadImages(array, keyOverrides){
            if(!keyOverrides){
                keyOverrides = {};
            }
            
            array.forEach(url => {
                AssetManager.loadImage(url, keyOverrides[url]);
            });
        }

        static storeImage(image, keyOverride){
            if(image instanceof window.HTMLImageElement){
                let key = (typeof keyOverride === "string") ? keyOverride : image.getAttribute("src");

                if(!(key in AssetManager.IMAGE_CACHE)){
                    AssetManager.IMAGE_CACHE[key] = image;
                }
            }
            else throw new Error("Image argument must be of type HTMLImageElement.");
        }

        static loadAudio(url, done, keyOverride){
            let key = (typeof keyOverride === "string") ? keyOverride : url;

            if(key in AssetManager.AUDIO_CACHE){
                if(typeof done === "function"){
                    done(null, AssetManager.AUDIO_CACHE[key]);
                }

                return AssetManager.AUDIO_CACHE[key];
            }

            let audio = document.createElement("audio");

            audio.addEventListener("load", evt => {
                if(typeof done === "function"){
                    AssetManager.AUDIO_CACHE[key] = audio;

                    done(null, AssetManager.AUDIO_CACHE[key]);
                }
            });

            audio.addEventListener("error", evt => {
                if(typeof done === "function"){
                    done(evt, null);
                }
            });

            audio.setAttribute("src", url);

            AssetManager.AUDIO_CACHE[key] = audio;

            return audio;
        }

        static loadAudios(array, keyOverrides){
            if(!keyOverrides){
                keyOverrides = {};
            }

            array.forEach(url => AssetManager.loadAudio(url, keyOverrides[url]));
        }

        static storeAudio(audio, keyOverride){
            if(audio instanceof window.HTMLAudioElement){
                let key = (typeof keyOverride === "string") ? keyOverride : audio.getAttribute("src");

                if(!(key in AssetManager.AUDIO_CACHE)){
                    AssetManager.AUDIO_CACHE[key] = audio;
                }
            }
            else throw new Error("Audio argument must be of type HTMLAudioElement.");
        }
    };
    AssetManager.IMAGE_CACHE = {};
    AssetManager.AUDIO_CACHE = {};

    let Stage = class Stage extends DisplayObjectContainer{
        constructor(width=550, height=400){
            super(0, 0, 0, 0);

            this.canvas = document.createElement("canvas");
            this.context = this.canvas.getContext("2d");

            this.canvas.setAttribute("dark-canvas", "true");

            this.resize(width, height);
            this.resizeDisplay(width, height);

            this.canvas.addEventListener("click", evt => {
                let x = evt.clientX * (this.width / this.canvasWidth),
                    y = evt.clientY * (this.height / this.canvasHeight);

                let mouse = new DisplayObject(x, y, 3, 3);

                stage.forAllChildren(child => {
                    if(mouse.hitboxCollision(child, true)){
                        child.emit(new Event(Event.CLICK, child));
                    }
                });
            });
        }

        fullscreenResize(evt){
            if(window.innerWidth > window.innerHeight){
                this.canvas.style.width = window.innerWidth + "px";
                this.canvas.style.height = window.innerWidth * (this.canvas.height / this.canvas.width) + "px";
            }
            else{
                this.canvas.style.width = window.innerWidth + "px";
                this.canvas.style.height = window.innerWidth * (this.canvas.height / this.canvas.width) + "px";
            }
        }

        fullscreenMode(){
            window.addEventListener("resize", this.fullscreenResize.bind(this));
            
            this.canvas.style.position = "absolute";
            this.canvas.style.left = "0px";
            this.canvas.style.top = "0px";

            this.fullscreenResize();
        }

        draw(){
            if(this.visible){
                this.emit(new Event(Event.DRAW));
                this.clear();
                this.drawChildren();
            }
        }

        clear(){
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        resizeDisplay(width, height){
            this.canvas.style.width  = width + "px";
            this.canvas.style.height = height + "px";
        }

        resize(width, height){
            this.canvas.width = width;
            this.canvas.height = height;
        }

        set showHitboxes(bool){
            this.forAllChildren(child => {
                child.showHitbox = bool;
            });
        }

        set width(width){
            super.width = width;
            this.canvas.width = width;
        }

        set height(height){
            super.height = height;
            this.canvas.height = height;
        }

        get width(){
            return this.canvas.width;
        }

        get height(){
            return this.canvas.height;
        }

        get canvasWidth(){
            return this.canvas.offsetWidth || this.canvas.width;
        }

        get canvasHeight(){
            return this.canvas.offsetHeight || this.canvas.height;
        }
    };

    let GameObject = class GameObject extends AnimatedSprite{
        constructor(image=null, x=0, y=0, width=0, height=0){
            super(image, x, y, width, height);

            this.objectID = -1;
            this.ownerID = -1;
            this.teamID = -1;
            this.moveSpeed = 1;
            
            this._nameTag = null;
            this._sounds = {};
        }

        nametag(name){
            this.removeNametag();

            this._nameTag = new TextField(name);
            this.addChild(this._nameTag);
            this._nameTag.centerText();
            this._nameTag.y -= 10;
            this._nameTag.font = GameObject.NAMETAG_FONT;
        }

        removeNametag(){
            if(this._nameTag){
                this._nameTag.remove();
                this._nameTag = null;
            }
        }

        setSound(name, url){
            this._sounds[name] = url;
        }

        playSound(soundName){
            if(soundName in this._sounds){
                SoundManager.playSound(this._sounds[soundName]);
            }
        }

        moveUp(collidables, bounds, scroller){
            this.y -= this.moveSpeed;

            let hit = null;

            if(collidables){
                if(collidables instanceof CollisionGrid){
                    hit = collidables.collisionAbove(this);
                }
                else if(collidables instanceof Array){
                    hit = this.hitboxCollisions(collidables);
                }

                if(hit){
                    this.y += this.moveSpeed;
                    return hit;
                }
            }

            if(bounds){
                if(this.y < bounds.y){
                    this.y = bounds.y;
                }
            }

            if(scroller){
                scroller.scrollYWith(this, -this.moveSpeed);
            }

            return hit;
        }

        moveDown(collidables, bounds, scroller){
            this.y += this.moveSpeed;

            let hit = null;

            if(collidables){
                if(collidables instanceof CollisionGrid){
                    hit = collidables.collisionBelow(this);
                }
                else if(collidables instanceof Array){
                    hit = this.hitboxCollisions(collidables);
                }

                if(hit){
                    this.y -= this.moveSpeed;
                    return hit;
                }
            }

            if(bounds){
                if(this.bottom > bounds.bottom){
                    this.y = bounds.bottom - this.height;
                }
            }

            if(scroller){
                scroller.scrollYWith(this, this.moveSpeed);
            }

            return hit;
        }

        moveLeft(collidables, bounds, scroller){
            this.x -= this.moveSpeed;

            let hit = null;

            if(collidables){
                if(collidables instanceof CollisionGrid){
                    hit = collidables.collisionLeft(this);
                }
                else if(collidables instanceof Array){
                    hit = this.hitboxCollisions(collidables);
                }

                if(hit){
                    this.x += this.moveSpeed;
                    return hit;
                }
            }

            if(bounds){
                if(this.x < bounds.x){
                    this.x = bounds.x;
                }
            }

            if(scroller){
                scroller.scrollXWith(this, -this.moveSpeed);
            }

            return hit;
        }

        moveRight(collidables, bounds, scroller){
            this.x += this.moveSpeed;

            let hit = null;

            if(collidables){
                if(collidables instanceof CollisionGrid){
                    hit = collidables.collisionRight(this);
                }
                else if(collidables instanceof Array){
                    hit = this.hitboxCollisions(collidables);
                }

                if(hit){
                    this.x -= this.moveSpeed;
                    return hit;
                }
            }

            if(bounds){
                if(this.right > bounds.right){
                    this.x = bounds.right - this.width;
                }
            }

            if(scroller){
                scroller.scrollXWith(this, this.moveSpeed);
            }

            return hit;
        }

        applyUpdate(data){
            if(typeof data.x === "number"){
                this.x = data.x;
            }

            if(typeof data.y === "number"){
                this.y = data.y;
            }

            if(typeof data.anim === "string"){
                this.playAnimation(data.anim);
            }
        }

        getData(){
            return {
                objectID: this.objectID,
                ownerID: this.ownerID,
                teamID: this.teamID,
                x: this.x,
                y: this.y,
                anim: this.currAnim
            };
        }
    };
    GameObject.NAMETAG_FONT = TextField.DEFAULT_FONT;

    let renderLoop = function(){
        if(initialized){
            stage.draw();
            window.requestAnimationFrame(renderLoop);
        }
    };

    let init = function(element, drawWidth=550, drawHeight=400, canvasWidth=550, canvasHeight=400){
        if(initialized){
            return false;
        }

        if(typeof element === "string"){
            element = document.querySelector(element);
        }
        element = (!element || (element instanceof window.Element === false)) ? document.body : element;

        stage.resize(drawWidth, drawHeight);
        stage.resizeDisplay(canvasWidth, canvasHeight);

        element.appendChild(stage.canvas);

        initialized = true;
        renderLoop();

        dark.stage.visible = true;

        return true;
    };

    let kill = function(){
        stage.visible = false;
        stage.forEachChild(child => child.remove());

        if(stage.canvas.parentNode){
            stage.canvas.parentNode.removeChild(stage.canvas);
        }

        initialized = false;
        return !initialized;
    };

    let stage = new Stage();
    const CTX = stage.context;

    return {
        init: init,
        kill: kill,
        stage: stage,
        AnimatedSprite: AnimatedSprite,
        AssetManager: AssetManager,
        Bounds: Bounds,
        CollisionGrid: CollisionGrid,
        Event: Event,
        EventEmitter: EventEmitter,
        DisplayObject: DisplayObject,
        DisplayObjectContainer: DisplayObjectContainer,
        GameObject: GameObject,
        KeyHandler: KeyHandler,
        MapBuilder: MapBuilder,
        ObjectManager: ObjectManager,
        RNG: RNG,
        Scroller: Scroller,
        Sprite: Sprite,
        SoundManager: SoundManager,
        Stage: Stage,
        TextField: TextField
    };
})();

if(typeof module !== "undefined"){
    module.exports = dark;
}