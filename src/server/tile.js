const { merge, fromString, add, subtract, interpolate, toRGB } = require('../shared/util');
const Constants = require('../shared/constants');

class Tile {
    constructor(type, x, y) {
      this.type = type;
      this.x = x;
      this.y = y;
      var typeData = Constants.TILE_TYPES[type];
      this.sprite = null;
      this.blood = 0;
      this.maxBlood = 0.7;
      this.charBloodIntensity = 0.7;
      this.bgBloodIntensity = 0.5;
      merge(this, typeData);
    }

    applyBlood(){
        if(this.blood > 0){
            var intensity = Math.floor(this.blood * 75);
            var bloodVal;
            var tempBg = this.bgColor;
            if(tempBg){
                bloodVal = [Math.floor(intensity * this.bgBloodIntensity), 0, 0];
                tempBg = fromString(tempBg);
                tempBg = add(tempBg, bloodVal);
                tempBg = interpolate(tempBg, bloodVal, 0.05);
                tempBg = toRGB(tempBg);
            }
        }
        this.bgColor = tempBg;
    }

    serializeForUpdate() {
        if(this.sprite){
            return {
                bgColor: this.bgColor,
                sprite: this.sprite,
            };
        }
        else{
            return {
                bgColor: this.bgColor
            };
        }
    }
}
module.exports = Tile;