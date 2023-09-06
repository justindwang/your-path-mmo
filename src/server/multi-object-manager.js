const Array2d = require('./array-2d');
const Constants = require('../shared/constants');

class MultiObjectManager {
    constructor(game, ObjectConstructor, width, height) {
        this.game = game;
        this.ObjectConstructor = ObjectConstructor;
        this.objects = [];
        this.map = new Array2d();
        this.setSize(width, height);

        var map = this.map;
        this.map.each(function(val, x, y){
            map.set(x, y, []);
        });
    }
    get(x, y, filter) {
        if(filter){
            return this.map.get(x, y).filter(filter);
        }
        return this.map.get(x, y);
    }
    getFirst(x, y, filter){
        var arr = this.map.get(x, y);
        if(arr){
            if(filter){
                var len = arr.length;
                for (var i = 0; i < len; i++) {
                    var item = arr[i];
                    if(filter(item)){
                        return item;
                    }
                }
            } else {
                return arr[0];
            }
        }
    }
    getLast(x, y, filter){
        var arr = this.map.get(x, y);
        if(arr){
            if(filter){
                for(var i = arr.length - 1; i >= 0; i--){
                    var item = arr[i];
                    if(filter(item)){
                        return item;
                    }
                }
            } else {
                return arr[arr.length - 1];
            }
        }
    }
    add(floorNumber, x, y, obj) {
        var og = obj;
        if(typeof obj === 'string'){
            obj = this.makeNewObjectFromType(obj);
        }
        if(!obj){
            console.log('im tryna make a: ');
            console.log(og);
            return;
        }
        obj.game = this.game;
        obj.floor = floorNumber;
        obj.x = x;
        obj.y = y;
        this.objects.push(obj);
        var arr = this.map.get(x, y);
        arr.push(obj);
        return obj;
    }
    remove(obj) {
        var arr = this.map.get(obj.x, obj.y);
        var index = arr.indexOf(obj);
        arr.splice(index, 1);
        index = this.objects.indexOf(obj);
        this.objects.splice(index, 1);
    }
    move(x, y, object) {
        this.remove(object);
        object.x = x;
        object.y = y;
        this.add(object.floor, x, y, object);
    }
    reset() {
        this.objects = [];
        this.map.reset();
        var map = this.map;
        this.map.each(function(val, x, y){
            map.set(x, y, []);
        });
    }
    setSize(width, height){
        this.map.setSize(width, height);
        var map = this.map;
        this.map.each(function(val, x, y){
            if(val === void 0){
                map.set(x, y, []);
            }
        });
    }
    getAdjacent(x, y, settings){
        settings = settings || {};
        if(settings.filter){
            var filter = settings.filter;
            settings.filter = function(objects){
                return objects.filter(filter);
            };
        }
        var results = this.map.getAdjacent(x, y, settings);
        var out = [];
        // merge all arrays
        return out.concat.apply(out, results);
    }
    loadFromArrayString(floorNumber, mapData, charToType, defaultType){
        var _this = this,
            width = mapData[0].length,
            height = mapData.length;

        if(width !== this.map.width || height !== this.map.height){
            this.setSize(width, height);
        }

        // loop over each coord in the Array2d (val will be undefined)
        this.map.each(function(val, x, y){
            var char = mapData[y][x],
                type = charToType[char];
            if(type === void 0 && defaultType){
                type = defaultType;
            }
            if(type !== void 0){
                var entity = _this.makeNewObjectFromType(type);
                _this.add(floorNumber, x, y, entity);
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
            if (obj.dead) {
                this.remove(obj);
                continue;
            }
            if(obj.update){
                obj.update();
            }
        }
    }
    
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
                var object = this.getFirst(tileX, tileY);
                if(object){      
                    result[x][y] = object.serializeForUpdate();
                }
            }
        }
        return result;
    }
}
module.exports = MultiObjectManager;