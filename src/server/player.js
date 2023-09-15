const Constants = require('../shared/constants');
const { getOffsetCoordsFromDirection, COLORS, mapAbbrToStat, randomColor, getRandomFromRate, serializeArray, exportArr } = require('../shared/util');
const { Item } = require('./item');
const Outfit = require('./outfit');
const Job = require('./job');
const Skill = require('./skill');
const FusedSkill = require('./fused-skill');
const { Stat, STAT_TYPES } = require('./stat');

class Player{
  constructor(game, socketId, name, job, x, y, discordId) {
    this.game = game;
    this.socketId = socketId;
    this.discordId = discordId;
    this.type = 'player';
    this.sprite = '';
    this.inventory = [[new Item(this.game, 'descension_crystal'), 1], [new Item(this.game, 'tiny_hp_potion'), 5],[new Item(this.game, 'tiny_mp_potion'), 5]];
    this.skills = [];
    // does not include current job
    this.jobs = [];
    this.outfits = [new Outfit('casual_hoodie'), new Outfit('casual_blouse')];
    this.stats = this.initializeStats();

    this.name = name;
    this.job = new Job(job);
    this.outfit = new Outfit(this.job.outfit);
    this.title = 'none';

    this.level = 1;
    this.gold = 0;

    this.floor = 1;
    this.x = x;
    this.y = y;

    this.hp = Constants.PLAYER_MAX_HP;
    this.hpMax = Constants.PLAYER_MAX_HP;
    this.mp = Constants.PLAYER_MAX_MP;
    this.mpMax = Constants.PLAYER_MAX_MP;

    // this.hp = 200;
    // this.hpMax = 200;

    this.exp = 0;
    this.expForNext = 10;

    this.strength = 2;
    this.vitality = 1,
    this.agility = 1,
    this.intelligence = 1,
    this.luck = 1,

    this.statPoints = 0,

    this.pendingAction = false;
    this.bleeds = true;

    // this.maxMoveCd = 10;
    // this.currMoveCd = 10;
    // this.maxActionCd = 10;
    // this.currActionCd = 10;
    this.mpRegenCd = 20;
    this.maxMpRegenCd = 20;

    this.applyAgility();

    this.weapon = new Item(this.game, 'fists');
    this.fusedSkill = new FusedSkill(this);
    this.skillSlots = 2;
    this.applyWeaponStats(this.weapon);

    // battle mechanics
    this.dodges = 0;
    this.damageReduction = 0;

    if(name == 'tests'){
      this.inventory.push([new Item(this.game, 'job_change_ticket'), 5]);
    }
  }
  getClass(){
    return 'player';
  }

  canMoveTo(x, y){
    return this.game.playerCanMoveTo(this, this.floor, x, y);
  }
  moveTo(x, y) {
    return this.game.entityMoveTo(this, this.floor, x, y);
  }
  queueMove(action){
    if(this.currMoveCd <= 0){
      this.currMoveCd = this.maxMoveCd;
      return this.move(action);
    }
  }
  queueAttack(target){
    if(this.currActionCd <= 0){
      this.currActionCd = this.maxActionCd;
      return this.attack(target);
    }
  }

  queueSkill(coords){
    if(this.fusedSkill.currCd <= 0 && this.mp >= this.fusedSkill.mpCost){
      this.mp -= this.fusedSkill.mpCost;
      this.fusedSkill.currCd = this.fusedSkill.maxCd;
      return this.fusedSkill.cast(coords);
    }
  }

  queueOpen(target){
    if(this.currActionCd <= 0){
      this.currActionCd = this.maxActionCd;
      return this.open(target);
    }
  }
  takeDamage(amount) {
    this.hp -= amount;
    if(this.hp <= 0) {
        this.color = COLORS.hp_red;
        this.dead = true;
        this.sprite = 'tombstone.png';
    }
  }
  gainExp(expGain){
    this.exp += expGain;
    // level up
    if(this.exp >= this.expForNext){
        this.exp = 0;
        this.level++;
        this.expForNext = this.exptoNextLevel(this.level);
        var hpGain = this.hpGainFromVit();
        var mpGain = this.mpGainFromInt();
        this.hp += hpGain;
        this.mp += mpGain;
        this.hpMax += hpGain;
        this.mpMax += mpGain;
        if(this.hp > this.hpMax)
            this.hp = this.hpMax;
        if(this.mp > this.mpMax)
            this.mp = this.mpMax;
        this.strength += this.job.strengthGrowth;
        this.intelligence += this.job.intelligenceGrowth;
        this.vitality += this.job.vitalityGrowth;
        this.agility += this.job.agilityGrowth;
        this.luck += this.job.luckGrowth;
        this.statPoints++;
        this.applyAgility();
        // this.game.console.logLevelUp(this.level);
    }
  }
  heal(amount){
    this.hp += amount;
    if(this.hp > this.hpMax){
        this.hp = this.hpMax;
    }
    // RL.Util.arrFind(this.game.menu.stats, 'hp_healed').incrementBy(amount);
  }
  restoreMp(amount){
    this.mp += amount;
    if(this.mp > this.mpMax){
        this.mp = this.mpMax;
    }
  }

  exptoNextLevel(level){
    return 10*Math.floor(level*1.055**(level-1));
  }
  hpGainFromVit(){
    return Math.floor(1234 * Math.tanh(0.001 * this.vitality));
  }

  mpGainFromInt(){
     return Math.floor(1234 * Math.tanh(0.0005 * this.intelligence));
  }
  applyAgility(){
    var cd = 10;
    if(this.agility >= 100)
      cd = 5;
    else if (this.agiliy >= 75)
      cd = 6;
    else if (this.agility >= 50)
      cd = 7;
    else if(this.agility >= 25)
      cd = 8;
    else if(this.agility >= 10)
      cd = 9;
    this.maxMoveCd = cd;
    this.currMoveCd = cd;
    this.maxActionCd = cd;
    this.currActionCd = cd;
  }
  update() {
    // movecd 
    if(this.currMoveCd > 0)
      this.currMoveCd--;
    // actioncd
    if(this.currActionCd > 0)
      this.currActionCd--;
    // skillcd
    if(this.fusedSkill.currCd > 0)
      this.fusedSkill.currCd--;
    // mp regen
    if(this.mpRegenCd > 0)
      this.mpRegenCd--;
    else{
      this.restoreMp(this.mpMax * 0.1);
      this.mpRegenCd = this.maxMpRegenCd;
    }
    return;
  }
  move(direction){
    var offset = getOffsetCoordsFromDirection(direction),
        x = this.x + offset.x,
        y = this.y + offset.y;

    if(this.canMoveTo(x, y)){
        this.moveTo(x, y);
        // RL.Util.arrFind(this.game.menu.stats, 'tiles_traveled').increment();
        return true;

    }
    else {
      if(this.movePush(x, y)){
          return true;
      }
      if(this.moveAttack(x, y)){
          return true;
      }
      if(this.moveOpen(x, y)){
          return true;
      }
    }
    return false;
  }

  attack(target){
    if(target.dead)
      return false;
    var finalDamage = Math.floor(this.strength * (1 - target.damageReduction));
    // if(this.game.player.attemptCrit())
    //     finalDamage = Math.floor(2.5 * source.strength);
    // else
    //     finalDamage = this.strength;
    // for(var s = 0; s < this.game.player.skills.length; s++){
    //     this.game.player.skills[s].performOnHit();
    //     this.game.player.renderHtml();
    // }
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

    this.game.floors[this.floor].smashLayer.set(this.x, this.y, smash);
    this.game.floors[this.floor].damageLayer.set(target.x, target.y, damage);

    target.takeDamage(finalDamage);
    var class_ = target.getClass();
    if(class_ == 'entity')
      this.fusedSkill.performOnHits(target);
    if(target.dead){
      if(class_ == 'entity'){
        var loot = getRandomFromRate(target.loot);
        if (loot != 'nothing' && !this.game.floors[this.floor].itemManager.getFirst(target.x, target.y)){
            loot = new Item(this.game, loot);
            this.game.floors[this.floor].itemManager.add(target.floor, target.x, target.y, loot);
        }
        this.game.floors[this.floor].entityManager.remove(target);
        this.gainExp(target.exp);
        this.game.floors[this.floor].spawnEnemy();
        // RL.Util.arrFind(this.game.menu.stats, 'enemies_killed').increment();
      }
      else if (class_ == 'furniture'){
        this.game.floors[this.floor].furnitureManager.remove(target);
        this.game.floors[this.floor].spawnFurniture();
      }
    }
    if(target.bleeds){
      var splatter = 0.1;
      if(target.dead){
          splatter *= 1.5;
      }
      this.game.splatter(target.floor, target.x, target.y, splatter);
    }
    return true;
  }

  skillAttack(target, damage){
    if(target.dead)
      return false;
    var finalDamage = Math.floor(damage * (1 - target.damageReduction));
    // if(this.game.player.attemptCrit())
    //     finalDamage = Math.floor(2.5 * source.strength);
    // else
    //     finalDamage = this.strength;
    // for(var s = 0; s < this.game.player.skills.length; s++){
    //     this.game.player.skills[s].performOnHit();
    //     this.game.player.renderHtml();
    // }
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
      color: randomColor('blue'), 
    };

    this.game.floors[this.floor].smashLayer.set(this.x, this.y, smash);
    this.game.floors[this.floor].damageLayer.set(target.x, target.y, damage);

    target.takeDamage(finalDamage);
    var class_ = target.getClass();
    if(class_ == 'entity')
      this.fusedSkill.performOnHits(target);
    if(target.dead){
      if(class_ == 'entity'){
        var loot = getRandomFromRate(target.loot);
        if (loot != 'nothing' && !this.game.floors[this.floor].itemManager.getFirst(target.x, target.y)){
            loot = new Item(this.game, loot);
            this.game.floors[this.floor].itemManager.add(target.floor, target.x, target.y, loot);
        }
        this.game.floors[this.floor].entityManager.remove(target);
        this.gainExp(target.exp);
        // RL.Util.arrFind(this.game.menu.stats, 'enemies_killed').increment();
      }
    }
    if(target.bleeds){
      var splatter = 0.1;
      if(target.dead){
          splatter *= 1.5;
      }
      this.game.splatter(target.floor, target.x, target.y, splatter);
    }
    return true;
  }

  open(target){
    if(target.type == 'door'){
      target.passable = true;
      target.blocksLos = false;
      target.sprite = 'door_open.png';
      return true;
  }
  else if(target.type == 'crate'){
      // RL.Util.arrFind(this.game.menu.stats, 'crates_opened').increment();
      this.game.floors[this.floor].furnitureManager.remove(target);
      // need to change for diff floors
      var loot = new Item(this.game, this.game.generateCrateLoot(Constants.FLOOR_DATA[this.floor].crateLoot));
      this.game.floors[this.floor].itemManager.add(target.floor, target.x, target.y, loot);
      return true;
  }
  }

  movePush(x, y){
    // var _this = this;
    // var furniture = this.game.furnitureManager.getFirst(x, y, function(furniture){
    //     return _this.canPerformAction('push', furniture);
    // });

    // if(!furniture){
    //     return false;
    // }
    // return this.performAction('push', furniture);
  }

  moveAttack(x, y){
    var entity = this.game.floors[this.floor].entityManager.getFirst(x, y);
    if(!entity){
        return false;
    }
    return this.attack(entity);
  }

  moveOpen(x, y){
    var furniture = this.game.floors[this.floor].furnitureManager.getFirst(x, y);
    if(!furniture){
        return false;
    }
    if(furniture.openable)
      return this.open(furniture);
    return false;
  }

  pixelToTileCoords(x, y){
    return {
        x: Math.floor(x / Constants.TILE_SIZE) + (this.x - Math.floor(Constants.RENDER_SIZE * 0.5)),
        y: Math.floor(y / Constants.TILE_SIZE) + (this.y - Math.floor(Constants.RENDER_SIZE * 0.5))
    };
  }
  hoverToTileCoords(x, y){
    return {
        x: x + (this.x - Math.floor(Constants.RENDER_SIZE * 0.5)),
        y: y + (this.y - Math.floor(Constants.RENDER_SIZE * 0.5))
    };
  }

  applyWeaponStats(weapon){
    if(weapon.stat1)
        this[mapAbbrToStat(weapon.stat1)] = Math.max(0, this[mapAbbrToStat(weapon.stat1)] + weapon.stat1Modifier);
    if(weapon.stat2)
        this[mapAbbrToStat(weapon.stat2)] = Math.max(0, this[mapAbbrToStat(weapon.stat2)] + weapon.stat2Modifier);
    if(weapon.stat3)
        this[mapAbbrToStat(weapon.stat3)] = Math.max(0, this[mapAbbrToStat(weapon.stat3)] + weapon.stat3Modifier);
  }

  removeWeaponStats(weapon){
    if(weapon.stat1)
        this[mapAbbrToStat(weapon.stat1)] = Math.max(0, this[mapAbbrToStat(weapon.stat1)] - weapon.stat1Modifier);
    if(weapon.stat2)
        this[mapAbbrToStat(weapon.stat2)] = Math.max(0, this[mapAbbrToStat(weapon.stat2)] - weapon.stat2Modifier);
    if(weapon.stat3)
        this[mapAbbrToStat(weapon.stat3)] = Math.max(0, this[mapAbbrToStat(weapon.stat3)] - weapon.stat3Modifier);
  }

  initializeStats(){
    var list = [];
    for (const [key, value] of Object.entries(STAT_TYPES)) {
        var temp = new Stat(this.game, key);
        list.push(temp);
    }
    return list;
  }

  fullHeal(){
    this.hp = this.hpMax;
    this.mp = this.mpMax;
  }

  // serializeArray(arr) {
  //   var res = [];
  //   for(var i = 0; i<arr.length; i++){
  //     res.push(arr[i].serializeForMenuUpdate());
  //   }
  //   return res;
  // }

  loadInventoryFromSave(inventoryString){
    this.inventory = [];
    var obj = JSON.parse(inventoryString);
    for (const [key, value] of Object.entries(obj)) {
      this.inventory.push([new Item(this.game, key), value]);
    }
  }
  loadStatsFromSave(statsString){
    this.stats = [];
    var obj = JSON.parse(statsString);
    for (const [key, value] of Object.entries(obj)) {
      var temp = new Stat(this.game, key);
      if(value.count)
        temp.count = value.count;
      this.stats.push(temp);
    }
  }

  loadArrFromSave(ObjectConstructor, arrayString, selfRef){
    var res = [];
    var arr = JSON.parse(arrayString);
    for(var s = 0; s < arr.length; s++){
      if(selfRef)
        res.push(new ObjectConstructor(this.game, arr[s]));
      else
        res.push(new ObjectConstructor(arr[s]));
    }
    return res;
  }

  exportInventory(){
    var res = {};
    for(var s = 0; s < this.inventory.length; s++){
      res[this.inventory[s][0].type] = this.inventory[s][1];
    }
    return JSON.stringify(res);
  }

  exportStats(){
    var res = {};
    for(var s = 0; s < this.stats.length; s++){
      res[this.stats[s].key] = this.stats[s].serializeForExport();
    }
    return JSON.stringify(res);
  }

  loadSavedData(playerData){
    this.sprite = playerData.sprite;
    this.job = new Job(playerData.job);
    this.outfit = new Outfit(playerData.outfit);
    this.level = playerData.level;
    this.title = playerData.title;
    this.gold = playerData.gold;
    this.hp = playerData.hp;
    this.hpMax = playerData.hpMax;
    this.mp = playerData.mp;
    this.mpMax = playerData.mpMax;
    this.strength = playerData.strength;
    this.vitality = playerData.vitality;
    this.agility = playerData.agility;
    this.intelligence = playerData.intelligence;
    this.luck = playerData.luck;
    this.weapon = new Item(this.game, playerData.weapon);
    this.loadInventoryFromSave(playerData.inventory);
    this.outfits = this.loadArrFromSave(Outfit, playerData.outfits, false);
    this.jobs = this.loadArrFromSave(Job, playerData.jobs, false);
    this.loadStatsFromSave(playerData.stats);

    this.exp = playerData.exp;
    this.expForNext = playerData.expForNext;
    this.skillSlots = playerData.skillSlots;
    this.skills = this.loadArrFromSave(Skill, playerData.skills, true);
    this.fusedSkill.load(playerData.fusedSkill);
  }

  exportSavedData(){
    return {
      discordId: this.discordId,
      name: this.name,
      sprite: this.sprite,
      level: this.level,
      job: this.job.type,
      outfit: this.outfit.type,
      title: this.title,
      gold: this.gold,
      hp: this.hp,
      hpMax: this.hpMax,
      mp: this.mp,
      mpMax: this.mpMax,
      strength: this.strength,
      vitality: this.vitality,
      agility: this.agility,
      intelligence: this.intelligence,
      luck: this.luck,
      weapon: this.weapon.type,
      inventory: this.exportInventory(),
      outfits: exportArr(this.outfits),
      jobs: exportArr(this.jobs),
      stats: this.exportStats(),

      exp: this.exp,
      expForNext: this.expForNext,
      skillSlots: this.skillSlots,
      fusedSkill: exportArr(this.fusedSkill.list),
      skills: exportArr(this.skills),
    };
  }

  serializeForPlayerList() {
    return {
      name: this.name,
      sprite: this.sprite,
      level: this.level,
      job: this.job.name,
    };
  }

  serializeForUpdate() {
    return {
      socketId: this.socketId,
      name: this.name,
      dead: this.dead,
      sprite: this.sprite,
      level: this.level,
      exp: this.exp,
      expForNext: this.expForNext,
      job: this.job.name,
      title: this.title,
      gold: this.gold,

      floor: this.floor,
      x: this.x,
      y: this.y,

      hp: this.hp,
      hpMax: this.hpMax,
      mp: this.mp,
      mpMax: this.mpMax,
      strength: this.strength,
      vitality: this.vitality,
      agility: this.agility,
      intelligence: this.intelligence,
      luck: this.luck,
      statPoints: this.statPoints,

      weapon: this.weapon.serializeForMenuUpdate(),
      inventory: this.inventory.map(function(arr){
        return arr[0].serializeForMenuUpdate(arr[1]);
      }),
      skills: serializeArray(this.skills),
      outfits: serializeArray(this.outfits),
      jobs: serializeArray(this.jobs),
      stats: serializeArray(this.stats),
      fusedSkill: this.fusedSkill.serializeForMenuUpdate(),

      offset: true,
    };
  }
}
module.exports = Player;
