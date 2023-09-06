const Array2d = require("./array-2d");
const Lighting = require('./lighting');
const PreciseShadowcasting = require('./fov');
const { fromString, add, toRGB } = require('../shared/util');

class LightingROT {
    constructor(floor){
        this.floor = floor;
        this.lightingMap = new Array2d();
        this.lightingMap.set = this.lightingMap.set.bind(this.lightingMap);

        this.checkVisible = this.checkVisible.bind(this);
        this._fov = new PreciseShadowcasting(this.checkVisible);

        let settings = {
            range: 5,
            passes: 2,
            emissionThreshold: 100,
        };

        this.getTileReflectivity = this.getTileReflectivity.bind(this);
        this._lighting = new Lighting(this.getTileReflectivity, settings);
        this._lighting.setFOV(this._fov);

        this.ambientLight = [100,100,100];
        this.defaultWallReflectivity = 0.1;
        this.defaultFloorReflectivity = 0.1;
    }
    update(){
        this._lighting.compute(this.lightingMap.set);
    }
    shadeTile(x, y, tileData){
        var light = this.ambientLight;
        var lighting = this.get(x, y);

        var overlay = function(c1, c2){
            var out = c1.slice();
            for (var i = 0; i < 3; i++) {
                var a = c1[i],
                    b = c2[i];
                if(b < 128){
                    out[i] = Math.round(2 * a * b / 255);
                } else {
                    out[i] = Math.round(255 - 2 * (255 - a) * (255 - b) / 255);
                }
            }
            return out;
        };

        if(lighting){
            light = add(this.ambientLight, lighting);
        }

        if(tileData.color){
            var color = fromString(tileData.color);
            color = overlay(light, color);
            tileData.color = toRGB(color);
        }

        if(tileData.bgColor){
            var bgColor = fromString(tileData.bgColor);
            bgColor = overlay(light, bgColor);
            tileData.bgColor = toRGB(bgColor);
        }
        return tileData;
    }
    get(x, y){
        return this.lightingMap.get(x, y);
    }
    set(x, y, r, g, b){
        this._lighting.setLight(x, y, [r, g, b]);
    }
    remove(x, y){
        this._lighting.setLight(x, y);
    }
    getTileReflectivity(x, y){
        return this.defaultFloorReflectivity;
    }
    setSize(width, height){
        this.lightingMap.setSize(width, height);
    }
    checkVisible(x, y){
        var tile = this.floor.map.get(x, y);
        return tile && !tile.blocksLos;
    }
}

module.exports = LightingROT;