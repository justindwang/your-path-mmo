const { merge, COLORS, getOffsetCoordsFromDirection, randomColor } = require('../shared/util');
const Constants = require('../shared/constants');
// const Game = require('./game');

class Entity {
  constructor(game, type) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.floor = null;
    this.name = null;
    this.type = type;
    this.turnsSinceStumble = 0;
    this.hp = 10;
    this.bleeds = true;

    this.maxMoveCd = Constants.DEFAULT_CD;
    this.currMoveCd = Constants.DEFAULT_CD;
    this.maxActionCd = Constants.DEFAULT_CD;
    this.currActionCd = Constants.DEFAULT_CD/2;

    // battle mechanics
    this.stunCd = 0;
    this.damageReduction = 0;

    var typeData = Constants.ENTITY_TYPES[type];
    merge(this, typeData);
  }

  getClass(){
    return 'entity';
  }
  takeDamage(amount) {
    this.hp -= amount;
    if(this.hp <= 0) {
        this.color = COLORS.hp_red;
        this.dead = true;
    }
  }
  canMoveThrough(x, y){
    return this.game.entityCanMoveTo(this, this.floor, x, y);
  }
  canMoveTo(x, y){
    return this.game.entityCanMoveTo(this, this.floor, x, y);
  }
  moveTo(x, y) {
    return this.game.entityMoveTo(this, this.floor, x, y);
  }
  canSeeThrough(x, y){
    return this.game.entityCanSeeThrough(this, this.floor, x, y);
  }
  getConsoleName() {
    return {
        name: this.name,
        color: this.consoleColor
    };
  }
  getRandomAdjacentTile() {
    var directions = ['up', 'down', 'left', 'right'];
    var adjacent = [];

    for(var i = directions.length - 1; i >= 0; i--) {
        var dir = directions[i];
        var offset = getOffsetCoordsFromDirection(dir);
        var adjTileX = this.x + offset.x;
        var adjTileY = this.y + offset.y;
        if(this.canMoveTo(adjTileX, adjTileY)) {
            adjacent.push({
                x: adjTileX,
                y: adjTileY
            });
        }
    }

    if(adjacent && adjacent.length) {
        return adjacent[Math.floor(Math.random() * adjacent.length)];
    }
    return false;
  }
  isAdjacent(x, y) {
    return(
        (x === this.x && (y === this.y - 1 || y === this.y + 1)) ||
        (y === this.y && (x === this.x - 1 || x === this.x + 1))
    );
  }
  getNextPathTile(x, y, ignoreExtra) {
    var path = this.getPathToTile(x, y, ignoreExtra);
    path.splice(0, 1);
    if(path[0] && path[0].x !== void 0 && path[0].y !== void 0) {
        return path[0];
    }
  }
  getPathToTile(x, y, ignoreExtra) {
    var _this = this,
        path = [],
        computeCallback = function(x, y) {
            path.push({
                x: x,
                y: y
            });
        },
        passableCallback = function(x, y) {
            if(_this.x === x && _this.y === y) {
                return true;
            }
            return _this.canMoveTo(x, y, ignoreExtra);
            return true;
        },
        // prepare path to given coords
        aStar = new ROT.Path.AStar(x, y, passableCallback, {
            topology: 4
        });

    // compute from current tile coords
    aStar.compute(this.x, this.y, computeCallback);
    return path;
  }

  // applyWeaponStats(weapon){
  //   if(weapon.stat1)
  //       this[RL.Util.mapAbbrToStat(weapon.stat1)] = Math.max(0, this[RL.Util.mapAbbrToStat(weapon.stat1)] + weapon.stat1Modifier);
  //   if(weapon.stat2)
  //       this[RL.Util.mapAbbrToStat(weapon.stat2)] = Math.max(0, this[RL.Util.mapAbbrToStat(weapon.stat2)] + weapon.stat2Modifier);
  //   if(weapon.stat3)
  //       this[RL.Util.mapAbbrToStat(weapon.stat3)] = Math.max(0, this[RL.Util.mapAbbrToStat(weapon.stat3)] + weapon.stat3Modifier);
  // }
  // generateLoot(){
  //   return util.getRandomFromRate(this.loot);
  // }
  attack(target){
    if(target.dead)
      return false;
    // mob damage formula
    var finalDamage = Math.floor(this.strength * (1 - target.damageReduction));
    var smash = {
      cd: Constants.DEFAULT_CD/2,
      source: this,
      target: target,
      type: 'attack',
      targetX: target.x,
      targetY: target.y,
      sourceX: this.x,
      sourceY: this.y
    };

    var damage = {
      cd: Constants.DEFAULT_CD/2,
      val: finalDamage,
      offsetX: Constants.TILE_SIZE * (Math.random() * 0.6 - 0.3),
      offsetY: Constants.TILE_SIZE * (Math.random() * 0.6 - 0.3),
      color: randomColor('red'), 
    };
    // if players has dodge
    if (target.dodges > 0){
      target.dodges -= 1;
      damage.val = 'MISS';
      damage.color = randomColor('purple');
    }
    else{
      target.takeDamage(finalDamage);
      if(target.bleeds){
        var splatter = this.strength / 10;
        if(target.dead){
          splatter *= 1.5;
        }
        this.game.splatter(target.floor, target.x, target.y, splatter);
      }
    }
    this.game.floors[this.floor].smashLayer.set(this.x, this.y, smash);
    this.game.floors[target.floor].damageLayer.set(target.x, target.y, damage);
    return true;
  }

  update() {
    var result = this._update();
    return result;
  }
  _update() {
    var ret = false;
    // movement
    if(this.stunCd > 0){
      this.stunCd--;
      return;
    }
    if(this.currMoveCd > 0){
      this.currMoveCd--;
    }
    else{
      // calculate stumble/stuns

      // if (this.stunTurns > 0){
      //   this.stunTurns--;
      //   // this.game.console.log(this.game.console.wrap(this) + ' is stunned');
      //   return true;
      // }
      this.currMoveCd = this.maxMoveCd;
      var stumbleChance = this.turnsSinceStumble / this.maxTurnsWithoutStumble;
      if(this.turnsSinceStumble && Math.random() < stumbleChance) {
          this.turnsSinceStumble = 0;
          return true;
      }
      this.turnsSinceStumble++;

      var destination = this.getRandomAdjacentTile();
      if(destination) {
          this.moveTo(destination.x, destination.y);
      }
      ret = true;
    }
    // attack
    if(this.currActionCd > 0){
      this.currActionCd--;
    }
    else{
      this.currActionCd = this.maxActionCd;
      var targets = this.game.getAdjacentPlayers(this.floor, this.x, this.y);
      if(targets.length > 0){
        var target = targets[Math.floor(Math.random() * targets.length)];
        if(target){
          this.attack(target);
        }
      }
      ret = true;
    }
    return ret;
}

  serializeForUpdate() {
    return {
      sprite: this.sprite,
      name: this.name,
      hp: this.hp,
      hpMax: this.hpMax,
      stunned: this.stunCd > 0,
    };
  }
}
module.exports = Entity;