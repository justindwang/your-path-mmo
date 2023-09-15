const Constants = require('../shared/constants');
const { merge, COLORS } = require('../shared/util');

class Furniture {
    constructor(game, type, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.floor = null;
        this.type = type;
        this.dead = false;
        this.exp = 0;
        this.openable = false;

        // battle mechanics
        this.damageReduction = 0;

        var typeData = Constants.FURNITURE_TYPES[type];
        merge(this, typeData);

        this.actions = {};

        if(this.init){
            this.init();
        }
    }
    getClass(){
        return 'furniture';
    }
    takeDamage(amount){
        this.hp -= amount;
        if (this.hp <= 0) {
            this.dead = true;
        }
    }
    getConsoleName(){
        return {
            name: this.name,
            color: this.consoleColor
        };
    }
    canMoveTo(x, y){
        return this.game.entityCanMoveTo(this, this.floor, x, y);
    }
    moveTo(x, y) {
        return this.game.floors[this.floor].furnitureManager.move(x, y, this);
    }
    serializeForUpdate() {
        return {
          sprite: this.sprite,
          hp: this.hp,
          hpMax: this.hpMax,
        };
      }
}
module.exports = Furniture;