const Constants = require('../shared/constants');
const Map = require('./map');
const Array2d = require('./array-2d');
// const ObjectManager = require('./object-manager');
const MultiObjectManager = require('./multi-object-manager');
const Entity = require('./entity');
const Furniture = require('./furniture');
const { Item, ITEM_TYPES } = require('./item');
// const Skill = require('./skill');
const LightingROT = require('./lighting-rot');
const { random, apply2D, getRandomFromRate, prettyprint, merge } = require('../shared/util');

class Floor {
    constructor(game, number){
        this.number = number;
        this.game = game;
        this.map = new Map(this, Constants.MAP_SIZE, Constants.MAP_SIZE);
        this.entityManager = new MultiObjectManager(game, Entity, Constants.MAP_SIZE, Constants.MAP_SIZE);
        this.itemManager = new MultiObjectManager(game, Item, Constants.MAP_SIZE, Constants.MAP_SIZE);
        this.furnitureManager = new MultiObjectManager(game, Furniture, Constants.MAP_SIZE, Constants.MAP_SIZE);
        this.lighting = new LightingROT(this);
        this.lighting.setSize(Constants.MAP_SIZE, Constants.MAP_SIZE);

        this.smashLayer = new Array2d();
        this.damageLayer = new Array2d();
        this.smashLayer.setSize(Constants.MAP_SIZE, Constants.MAP_SIZE);
        this.damageLayer.setSize(Constants.MAP_SIZE, Constants.MAP_SIZE);
        // this.console = new RL.Console(this);

        var floorData = Constants.FLOOR_DATA[number];
        merge(this, floorData);

        this.maxRetries = 50;
        let mapData = this.generateMap();
        this.map.loadTilesFromArrayString(mapData, Constants.MAP_CHAR_TO_TYPE, 'floor');
        this.entityManager.loadFromArrayString(number, mapData, this.entityCharToType);
        this.itemManager.loadFromArrayString(number, mapData, this.itemsCharToType);
        this.furnitureManager.loadFromArrayString(number, mapData, this.furnitureCharToType);
        this.setLighting(5);
        this.lighting.update();
    }
    generateMap(){
        var mapData = [];
        var s = ['#'];
        var t = ['#','#'];
        for(var i = Constants.MAP_SIZE-3; i>=0; i--){
            s.push('.');
            t.push('#');
        }
        s.push('#');
        for(var j = Constants.MAP_SIZE-3; j>=0; j--){
            var ss = [...s];
            mapData.push(ss);
        }
        mapData.push(t);
        mapData.unshift(t);
        mapData = this.bsp(mapData, Math.floor(Math.log2(Constants.MAP_SIZE * Constants.MAP_SIZE))-1);
        this.addEntities(mapData);
        for(var k = mapData.length - 1; k>=0; k--){
            mapData[k] = mapData[k].join('');
        }
        return mapData;
    }
    bsp(array, max_iter){
        let vert_retries = 0;
        let hori_retries = 0;
        let n_iter = 0;
        let bspTree = [...array];
        let stack = [];
        stack.push([1, 1, bspTree[0].length-2, bspTree.length-2]);
        while (stack.length > 0) {
            if (n_iter >= max_iter)
                return bspTree;
            else
                n_iter++;
            let partition = stack.pop();
            let x1 = partition[0];
            let y1 = partition[1];
            let x2 = partition[2];
            let y2 = partition[3];
            if (random(0, 1) == 0){
                //vertical split
                let x = random(x1+1, x2-1);
                let h = y2-y1;
                while(x == Math.floor((x1+x2)/2) || x == Math.floor((x1+x2)/2) + 1){
                    vert_retries++;
                    if(vert_retries > this.maxRetries)
                        return bspTree;
                    x = random(x1 + 1, x2 - 1);
                }
                if((x-x1)/h < 0.45 || (x2-x)/h < 0.45){
                    stack.push(partition);
                    n_iter--;
                }
                else{
                    for (var k = y2; k >= y1; k--)
                        bspTree[x][k] = '#';
                    var mid = Math.floor((y1+y2)/2);
                    bspTree[x][mid - 1] = '+';
                    bspTree[x][mid] = '+';
                    bspTree[x][mid + 1] = '+';
                    stack.unshift([x1,y1, x-1, y2]);
                    stack.unshift([x+1,y1, x2, y2]);
                }
            }
            else{
                //horizontal split
                let y = random(y1 + 1, y2 - 1);
                let w = x2-x1;
                while(y == Math.floor((y != (y1+y2)/2)) || y == Math.floor((y != (y1+y2)/2)) + 1){
                    hori_retries++;
                    if(hori_retries > this.maxRetries)
                        return bspTree;
                    y = random(y1 + 1, y2 - 1);
                }
                if( (y-y1)/w < 0.45 || (y2-y)/w < 0.45){
                    stack.push(partition);
                    n_iter--;
                }
                else{
                    for (var j = x2; j >= x1; j--)
                        bspTree[j][y] = '#';
                    var mid = Math.floor((x1+x2)/2);
                    bspTree[mid - 1][y] = '+';
                    bspTree[mid][y] = '+';
                    bspTree[mid + 1][y] = '+';

                    stack.unshift([x1,y1, x2, y-1]);
                    stack.unshift([x1,y+1, x2, y2]);    
                }
            }
        }
        return bspTree;
    }
    addEntities(array){
        var _this = this;
        function replace_with_sample(char) {
            if(char == '#')
                return '#';
            if(char == '+')
                return '+';
            return getRandomFromRate(_this.entities);
        }
        apply2D(array, replace_with_sample);
    
        // adding gate at random
        let x = null;
        let y = null;
        do {
            x = random(1, array[0].length-2);
            y = random(1, array.length-2);
        } while (array[x][y] != '.');
        array[x][y] = 'x';
    }
    setLighting(interval){
        var _this = this;
        _this.map.each(function(val, x, y){
            if((x+1) % interval === 0 && (y+1) % interval === 0){
                var tile = _this.map.get(x, y);
                if(tile.type !== 'wall'){
                    _this.lighting.set(x, y, 100, 100, 100);
                }
            }
        });
        
    }
    getTileColor(type){
        if(type == 'wall')
            return this.wallBgColor;
        return this.floorBgColor;
    }

    spawnEnemy(){
        let spawnX = null;
        let spawnY = null;
        do {
            spawnX = random(1, Constants.MAP_SIZE - 1);
            spawnY = random(1, Constants.MAP_SIZE - 1);
        } while (this.game.getObjectsAtPostion(this.number, spawnX, spawnY).length > 0 || this.map.get(spawnX, spawnY).name !='Floor');
        var newEntity = new Entity(this.game, getRandomFromRate(this.entitySpawner));
        this.entityManager.add(this.number, spawnX, spawnY, newEntity);
    }
    spawnFurniture(){
        let spawnX = null;
        let spawnY = null;
        do {
            spawnX = random(1, Constants.MAP_SIZE - 1);
            spawnY = random(1, Constants.MAP_SIZE - 1);
        } while (this.game.getObjectsAtPostion(this.number, spawnX, spawnY).length > 0 || this.map.get(spawnX, spawnY).name !='Floor');
        var type = getRandomFromRate(this.furnitureSpawner);
        if(Constants.FURNITURE_TYPES[type])
            this.furnitureManager.add(this.number, spawnX, spawnY, new Furniture(this.game, type));
        else
            this.itemManager.add(this.number, spawnX, spawnY, new Item(this.game, type));
    }
}
module.exports = Floor;