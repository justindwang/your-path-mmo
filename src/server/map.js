const Array2d = require('./array-2d');
const Tile = require('./tile');
const Constants = require('../shared/constants');
const { changeColor } = require('../shared/util');

class Map extends Array2d {
    constructor(floor, width, height) {
        super(width, height);
        this.floor = floor;
        this.bloodCd = Constants.TICK_RATE * 60;
    }
    set(x, y, tile) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        if(typeof tile === 'string'){
            tile = new Tile(tile, x, y);
        }
        this.data[x][y] = tile;
        return tile;
    }
    canSeeThroughTile(x, y){
        var tile = this.get(x, y);
        return tile && !tile.blocksLos;
    }
    canMoveThroughTile(x, y){
        var tile = this.get(x, y);
        return tile && tile.passable;
    }
    loadTilesFromArrayString(mapData, charToType, defaultTileType){
        var _this = this,
            width = mapData[0].length,
            height = mapData.length;

        this.width = width;
        this.height = height;
        this.reset();

        // loop over each coord in the Array2d (val will be undefined)
        this.each(function(val, x, y){
            var char = mapData[y][x],
                type = charToType[char];
            if(type === void 0 && defaultTileType){
                type = defaultTileType;
            }
            var tile = new Tile(type, x, y);
            tile.bgColor = _this.floor.getTileColor(type);
            _this.set(x, y, tile);
        });
    }
    serializeMapAt(r, c){
        // 2d array
        var result = [...Array(Constants.RENDER_SIZE)].map(e => Array(Constants.RENDER_SIZE));
        let originX = r - Math.floor(Constants.RENDER_SIZE * 0.5);
        let originY = c - Math.floor(Constants.RENDER_SIZE * 0.5);
        
        for (var x = Constants.RENDER_SIZE - 1; x >= 0; x--) {
            for (var y = Constants.RENDER_SIZE - 1; y >= 0; y--) {
                // get the actual map tile coord from view coord using offset
                var tileX = x + originX,
                    tileY = y + originY;
                var tile = this.get(tileX, tileY);
                if(tile){
                    var floorData = tile.serializeForUpdate();
                    var shaded = this.floor.lighting.shadeTile(tileX, tileY, floorData);              
                    result[x][y] = shaded;
                }
            }
        }
        return result;
    }
    // blood disappears every minute
    update(){
        if(this.bloodCd > 0)
            this.bloodCd--;
        else{
            this.bloodCd = Constants.TICK_RATE * 60;
            for(var x = this.width - 1; x >= 0; x--){
                for(var y = this.height - 1; y >= 0; y--){
                    var tile = this.get(x, y);
                    if(tile){
                        tile.bgColor = this.floor.getTileColor(tile.type);
                        tile.blood = 0;
                    }
                }
            }
        }
    }
}
module.exports = Map;