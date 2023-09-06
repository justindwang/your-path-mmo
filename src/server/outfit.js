const Constants = require('../shared/constants');
const { merge } = require('../shared/util');

class Outfit {
    constructor(type) {
        this.type = type;
        var outfitData = Constants.OUTFIT_TYPES[type];
        merge(this, outfitData);
    }
    serializeForMenuUpdate(){
        return {
            name: this.name,
            sprite: this.sprite,
            description: this.description,
        };
    }
}
module.exports = Outfit;