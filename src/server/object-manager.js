const Array2d = require('./array-2d');
const Constants = require('../shared/constants');

class ObjectManager {
    constructor(game, ObjectConstructor, width, height) {
        this.game = game;
        this.ObjectConstructor = ObjectConstructor;
        this.objects = [];
        this.map = new Array2d(width, height);
        this.map.setSize(width, height);
    }
    get(x, y) {
        return this.map.get(x, y);
    }
    add(x, y, obj) {
        if(typeof obj === 'string'){
            obj = this.makeNewObjectFromType(obj);
        }
        var existing = this.get(x, y);
        if(existing){
            this.remove(existing);
        }
        obj.game = this.game;
        obj.x = x;
        obj.y = y;
        this.objects.push(obj);
        this.map.set(x, y, obj);
        return obj;
    }
    remove(object) {
        this.map.remove(object.x, object.y);
        var index = this.objects.indexOf(object);
        this.objects.splice(index, 1);
    }
    move(x, y, object) {
        var existing = this.get(object.x, object.y);
        if(existing !== object || this.objects.indexOf(object) === -1){
            // throw new Error({error: 'Attempting to move object not in Object manager', x: x, y: y, object: object});
            console.log('moving object not in object manager');
            this.game.gameOver=true;
            return;
        }
        this.map.remove(object.x, object.y);
        object.x = x;
        object.y = y;
        this.map.set(x, y, object);
    }
    reset() {
        this.objects = [];
        this.map.reset();
    }
    setSize(width, height){
        this.map.setSize(width, height);
    }
    loadFromArrayString(mapData, charToType, defaultType, replaceCurrentObjects){
        var _this = this,
            width = mapData[0].length,
            height = mapData.length;

        if(width !== this.map.width || height !== this.map.height){
            this.map.setSize(width, height);
        }

        // loop over each coord in the Array2d (val will be undefined)
        this.map.each(function(val, x, y){
            var currentObj = val;
            if(currentObj){
                if(replaceCurrentObjects){
                    this.remove(currentObj);
                } else {
                    return;
                }
            }
            var char = mapData[y][x],
                type = charToType[char];
            if(type === void 0 && defaultType){
                type = defaultType;
            }
            if(type !== void 0){
                var entity = _this.makeNewObjectFromType(type);
                _this.add(x, y, entity);
            }
        });
    }
    makeNewObjectFromType(type){
        return new this.ObjectConstructor(this.game, type);
    }
    update(excludeObject) {
        // count down for performance and so we can remove things as we go
        for (var i = this.objects.length - 1; i >= 0; i--) {
            var obj = this.objects[i];
            if(excludeObject === obj){
                continue;
            }
            // if (obj.dead) {
            //     this.remove(obj);
            //     continue;
            // }
            if(obj.update){
                obj.update();
            }
        }
    }
    // to merge with prev sprites
    serializeObjectsAt(r, c, prevLayer){
        // 2d array
        var result = prevLayer;
        let originX = r - Math.floor(Constants.RENDER_SIZE * 0.5);
        let originY = c - Math.floor(Constants.RENDER_SIZE * 0.5);
        
        for (var x = Constants.RENDER_SIZE - 1; x >= 0; x--) {
            for (var y = Constants.RENDER_SIZE - 1; y >= 0; y--) {
                // get the actual map tile coord from view coord using offset
                var tileX = x + originX,
                    tileY = y + originY;
                var object = this.get(tileX, tileY);
                if(object){      
                    result[x][y] = object.serializeForUpdate();
                }
            }
        }
        return result;
    }
}
module.exports = ObjectManager;