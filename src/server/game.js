const sqlite3 = require('sqlite3').verbose();
const Constants = require('../shared/constants');
const Player = require('./player');
const { Item, ITEM_TYPES } = require('./item');
const Skill = require('./skill');
const Floor = require('./floor');
// const LightingROT = require('./lighting-rot');
const { random, apply2D, getRandomFromRate, getTileDistance, selectRandomElement, sortArrayOfObjects, COLORS, truncateToFiveCharacters, rankComparator, randomColor, exportArr } = require('../shared/util');
const { FLOOR_DATA } = require('../shared/constants');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 60);
    this.shop = this.generateShop();

    this.floors = {};
    // populating floors
    Object.keys(Constants.FLOOR_DATA).forEach(floorNumber => {
      this.floors[floorNumber] = new Floor(this, floorNumber);
    });
  }

  generatePlayerStartPosition(floorNumber){
    let playerStartX = null;
    let playerStartY = null;
    do {
        playerStartX = random(1, Constants.MAP_SIZE - 1);
        playerStartY = random(1, Constants.MAP_SIZE - 1);
    } while (this.getObjectsAtPostion(floorNumber, playerStartX, playerStartY).length > 0 || this.floors[floorNumber].map.get(playerStartX, playerStartY).name !='Floor');
    return [ playerStartX, playerStartY ];
  }
  getObjectsAtPostion(floorNumber, x, y){
    var result = [];

    var entity = this.floors[floorNumber].entityManager.getFirst(x, y);
    if(entity){
        result.push(entity);
    }
    var furniture = this.floors[floorNumber].furnitureManager.getFirst(x, y);
    if(furniture){
        result.push(furniture);
    }
    var item = this.floors[floorNumber].itemManager.getFirst(x, y);
    if(item){
        result.push(item);
    }
    return result;
  }
  entityCanMoveThrough(entity, floorNumber, x, y, ignoreFurniture){
    ignoreFurniture = ignoreFurniture !== void 0 ? ignoreFurniture : false;
    if(!ignoreFurniture){
        var furniture = this.floors[floorNumber].furnitureManager.getFirst(x, y, function(furniture){
            return !furniture.passable;
        });
        if(furniture){
            return false;
        }
    }
    var tile = this.floors[floorNumber].map.get(x, y);
    // if tile blocks movement
    if(!tile || !tile.passable){
        return false;
    }
    return true;
}
  entityCanMoveTo(entity, floorNumber, x, y, ignoreFurniture){
    if(!this.entityCanMoveThrough(entity, floorNumber, x, y, ignoreFurniture)){
      return false;
    }
    // check if occupied by entity
    if(this.floors[floorNumber].entityManager.getFirst(x, y)){
        return false;
    }
    // nothing besides player can move to exit
    if(this.floors[floorNumber].map.get(x,y).type == 'exit')
        return false;
    return true;
  }
  playerCanMoveTo(player, floorNumber, x, y, ignoreFurniture){
    if(!this.entityCanMoveThrough(player, floorNumber, x, y, ignoreFurniture)){
      return false;
    }
    // check if occupied by entity/player
    var obj = this.floors[floorNumber].entityManager.getFirst(x, y);
    if(obj){
      if(obj.type == 'player')
        return true;
      return false;
    }
    return true;
  }
  entityMoveTo(entity, floorNumber, x, y){
    if(entity.bleeds){
      var hpRatio = entity.hp / entity.hpMax;
      var bleedChance = ( 1 - hpRatio) * 0.5;
      if(hpRatio < 1 && Math.random() < bleedChance){
          this.floors[floorNumber].map.get(entity.x, entity.y).blood += bleedChance * 0.5;
      }
    }
    this.floors[floorNumber].entityManager.move(x, y, entity);
    
    var item = this.floors[floorNumber].itemManager.getFirst(x, y);
    if(item && item.canAttachTo(entity)){
        this.addItemToInventory(item, entity);
        this.floors[floorNumber].itemManager.remove(item);
    }

    // floor traversal TODO change to on entity enter 
    var tile = this.floors[floorNumber].map.get(x, y)
    if(tile.type == 'exit' && entity.getClass() == 'player'){
      this.playerChangeFloor(entity, entity.floor + 1);
    }
  }
  getAdjacentPlayers(floorNumber, x, y){
    var out = [];
    var potentials = this.floors[floorNumber].entityManager.map.getAdjacent(x, y, {withDiagonals: false});
    for (var i = 0; i < potentials.length; i++){
      if(!potentials[i])
        continue;
      if(potentials[i].getClass() == 'player'){
        out.push(potentials[i]);
      }
    }
    return out;
  }
  addItemToInventory(item, player){
    var inv = player.inventory;
    var found = false;
    for(var i = 0; i< inv.length; i++){
      if (inv[i][0].type == item.type){
        found = true;
        inv[i][1]++;
      }
    }
    if(!found)
        inv.push([item,1]);
  }

  removeItemFromInventory(item, player){
    var inv = player.inventory;
    for(var i = 0; i< inv.length; i++){
      if (inv[i][0].type == item.type){
          if(inv[i][1] > 1)
              inv[i][1]--;
          else
              inv.splice(i, 1);
          return;
      }
    }
  }

  entityCanSeeThrough(entity, floorNumber, x, y){
    var tile = this.floors[floorNumber].map.get(x, y);
    if(!tile || tile.blocksLos){
        return false;
    }
    var furniture = this.floors[floorNumber].furnitureManager.getFirst(x, y, function(furniture){
        return furniture.blocksLos;
    });

    if(furniture){
        return false;
    }
    return true;
  }
  
  splatter(floorNumber, x, y, amount){
    var tile = this.floors[floorNumber].map.get(x, y);
    tile.blood += amount;
    if(tile.blood > tile.maxBlood)
      tile.blood = tile.maxBlood;
    tile.applyBlood();
    var adj = this.floors[floorNumber].map.getAdjacent(x, y);
    for(var i = adj.length - 1; i >= 0; i--){
        var a = adj[i];
        a.blood += Math.random() * amount;
        if(a.blood > a.maxBlood)
          a.blood = a.maxBlood;
        a.applyBlood();
    }
  }

  generateCrateLoot(rates){
    var rank = getRandomFromRate(rates);
    return this.randomItemOfRank(rank);
  }
  getItemOfRank(rank){
    var pool = [];
    for (const [key, value] of Object.entries(ITEM_TYPES)) {
        if(value.rank == rank && value.group=='weapon')
            pool.push(key);
    }
    return pool;
  }
  randomItemOfRank(rank){
    var pool = this.getItemOfRank(rank);
    return selectRandomElement(pool);
  }
  serializeSmashLayerAt(floorNumber, r, c){
    // 2d array
    var result = [...Array(Constants.RENDER_SIZE)].map(e => Array(Constants.RENDER_SIZE));
    let originX = r - Math.floor(Constants.RENDER_SIZE * 0.5);
    let originY = c - Math.floor(Constants.RENDER_SIZE * 0.5);
    
    for (var x = Constants.RENDER_SIZE - 1; x >= 0; x--) {
        for (var y = Constants.RENDER_SIZE - 1; y >= 0; y--) {
            // get the actual map tile coord from view coord using offset
            var tileX = x + originX,
                tileY = y + originY;
            var smash = this.floors[floorNumber].smashLayer.get(tileX, tileY);
            if(smash){
                var offsetX,
                    offsetY,
                    smashColor = 'rgba(255, 255, 255, 0.75)';
                if(smash.type === 'attack'){

                    var vx = (smash.targetX - smash.sourceX);
                    var vy = (smash.targetY - smash.sourceY);
                    var dis = Math.sqrt(vx * vx + vy * vy);
                    vx /= dis;
                    vy /= dis;

                    var targetX = Math.round(vx + smash.sourceX);
                    var targetY = Math.round(vy + smash.sourceY);

                    offsetX = (targetX - smash.sourceX) * 0.5;
                    offsetY = (targetY - smash.sourceY) * 0.5;

                    smashColor = 'rgba(255, 255, 0, 0.75)';
                }

                result[x][y] = {
                    color: smashColor,
                    offsetX: offsetX * Constants.TILE_SIZE,
                    offsetY: offsetY * Constants.TILE_SIZE
                };
            }
        }
    }
    return result;
  }

  serializeDamageLayerAt(floorNumber, r, c){
    var result = [...Array(Constants.RENDER_SIZE)].map(e => Array(Constants.RENDER_SIZE));
    let originX = r - Math.floor(Constants.RENDER_SIZE * 0.5);
    let originY = c - Math.floor(Constants.RENDER_SIZE * 0.5);
    
    for (var x = Constants.RENDER_SIZE - 1; x >= 0; x--) {
        for (var y = Constants.RENDER_SIZE - 1; y >= 0; y--) {
            // get the actual map tile coord from view coord using offset
            var tileX = x + originX,
                tileY = y + originY;
            var damage = this.floors[floorNumber].damageLayer.get(tileX, tileY);
            if(damage){
                result[x][y] = {
                  char: truncateToFiveCharacters(damage.val),
                  offsetX: damage.offsetX,
                  offsetY: damage.offsetY,
                  color: damage.color,
                };
            }
        }
    }
    return result;
  }

  sortInventoryByKey(arr, key) {
    if(key == 'rank')
      return arr.sort((a, b) => (rankComparator(a[0], b[0])));
    return arr.sort((a, b) => (a[0][key] > b[0][key] ? 1 : -1));
  }

  generateShop(){
    let temp = [new Item(this, 'tiny_hp_potion'), new Item(this, 'tiny_mp_potion')];
    temp.push(new Item(this, this.randomItemOfRank('F')));
    temp.push(new Item(this, this.randomItemOfRank('E')));
    temp.push(new Item(this, this.randomItemOfRank('D')));
    temp.push(new Item(this, this.randomItemOfRank('C')));
    temp.push(new Item(this, this.randomItemOfRank('B')));
    temp.push(new Item(this, this.randomItemOfRank('A')));
    temp.push(new Item(this, this.randomItemOfRank('S')));
    temp.push(new Item(this, 'job_change_ticket'));
    return temp;
  }

  serializeShop() {
    var arr = [];
    for(var i = 0; i<this.shop.length; i++){
      arr.push(this.shop[i].serializeForMenuUpdate());
    }
    return arr;
  }

  serializePlayerList() {
    const playerArray = Object.keys(this.players).map((key) => ({
      key,
      ...this.players[key],
    }));
    // Sort the array of objects by the 'age' property in ascending order
    playerArray.sort((a, b) => b.level - a.level);

    var arr = [];
    for(var i = 0; i < playerArray.length; i++){
      arr.push(this.players[playerArray[i].key].serializeForPlayerList());
    }
    return arr;
  }

  playerUseItem(player, index, socket){
    var item = player.inventory[index][0];
    var amount = player.inventory[index][1];
    if(player.dead){
      if(item.group == 'revive'){
        player.dead = false;
        player.sprite = player.outfit.sprite;
        player.heal(item.healAmount);
        if(amount>1)
            player.inventory[index][1]--;
        else
            player.inventory.splice(index, 1);
        socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'inventory', message: '- Not even close -<br>- Restored ' + item.healAmount + ' HP -'});
      }
      else
        socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'inventory', message: '- Cannot use ' + item.name + ' when dead -'});
    }
    else{
      if(item.group == 'revive')
        socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'inventory', message: '- Cannot use ' + item.name + ' when alive -'});
      else {
        if(item.group == 'healing'){
          player.heal(item.healAmount);
          if(amount>1)
              player.inventory[index][1]--;
          else
              player.inventory.splice(index, 1);
          socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'inventory', message: '- Restored ' + item.healAmount + ' HP -'});
        }
        else if(item.group == 'mp_recovery'){  
          player.restoreMp(item.healAmount);
          if(amount>1)
              player.inventory[index][1]--;
          else
              player.inventory.splice(index, 1);
              socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'inventory', message: '- Restored ' + item.healAmount + ' MP -'});
        }
        else if(item.group == 'weapon'){
            var currWeapon = player.weapon;
            player.weapon = item;
            if(amount>1)
                player.inventory[index][1]--;
            else
                player.inventory.splice(index, 1);
            // add current weapon to inventory
            this.addItemToInventory(currWeapon, player);
            player.removeWeaponStats(currWeapon);
            player.applyWeaponStats(item);
            socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'inventory', message: '- Equipped ' + item.name + ' -'});
        }
        // else if (item.group == 'skill_scroll'){
        //     let new_skill = new RL.Skill(this.game, this.game.randomSkillOfRank(item.rank));
        //     if(amount>1)
        //         this.inventory[slotNum][1]--;
        //     else
        //         this.inventory.splice(slotNum, 1);
        //     if(RL.Util.arrFindType(this.skills, new_skill.type)){
        //         this.game.console.logDupeSkill(item, new_skill);
        //         return;
        //     }
        //     // if (this.skills.length < this.skillSlots){
        //     this.skills.push(new_skill);
        //     this.game.console.logLearnedSkill(new_skill);
        //     if(this.game.menu.weaponOrSkills == 'skills')
        //         this.game.menu.renderSkills();    
        //     // }
        //     // else{
        //     //     this.game.menu.renderSkills();
        //     //     this.game.console.logReplaceSkillDescription(item, new_skill);
        //     //     this.game.menu.addSkillReplaceListeners(new_skill);
        //     //     this.game.input.addBindings({cancel_replace: ['esc']});
        //     // }
        // }
        else if (item.group == 'misc'){
          // passing socket for log message
          item.performUse(player, socket);
          if(amount>1)
              player.inventory[index][1]--;
          else
              player.inventory.splice(index, 1);
        }
        else if(item.group == 'special'){
          item.performUse(player, socket);
        }
      }
    }
  }

  playerBuyItem(player, index, socket){
    var item = this.shop[index];
    if(player.gold >= item.cost){
        player.gold -= item.cost;
        this.addItemToInventory(item, player);
        socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'shop', message: '- Purchased 1x ' + item.name + ' -'});
    }
    else{
      socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'shop', message: '- Sorry, but you\'re broke -'});
        // this.game.console.logNotEnoughMoney(item);
    }
  }

  playerSellItem(player, index, socket){
    var item = player.inventory[index][0];
    if(item.group == 'special'){
      socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'shop', message: '- Special items can\'t be sold -'});
        return;
    }
    player.gold += Math.floor(item.cost/2);
    socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'shop', message: '- Sold 1x ' + item.name + ' for ' + (item.cost/2) + ' gold -'});
    this.removeItemFromInventory(item, player);            
  }

  playerChangeJob(player, index, socket){
    var newJob = player.jobs[index];
    var currJob = player.job;
    var jobs = player.jobs;
    jobs.splice(index, 1);
    jobs.push(currJob);
    player.job = newJob;
    // currJob.unequipEffect(player);
    // newJob.equipEffect(player);
    socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'jobs', message: '- Changed job to ' + newJob.name + ' -'});
  }

  playerChangeOutfit(player, index, socket){
    var newOutfit = player.outfits[index];
    var currOutfit = player.outfit;
    var outfits = player.outfits;
    outfits.splice(index, 1);
    outfits.push(currOutfit);
    player.outfit = newOutfit;
    player.sprite = newOutfit.sprite;
    socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'outfits', message: '- Changed into ' + newOutfit.name + ' -'});
  }

  playerFuseSkill(player, index, socket){
    player.fusedSkill.add(player.skills[index]);
    socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'skills', message: '- Fused ' + player.skills[index].name + ' -'});
  }

  playerIncreaseStat(player, stat){
    player.statPoints--;
    player[stat]++;
  }

  playerRespawn(player){
    let pos = this.generatePlayerStartPosition(player.floor);
    player.fullHeal();
    player.sprite = player.outfit.sprite;
    player.dead = false;
    this.floors[player.floor].entityManager.move(pos[0], pos[1], player);
  }

  playerChangeFloor(player, floor){
    if(Constants.FLOOR_DATA[floor]){
      this.floors[player.floor].entityManager.remove(player);
      let pos = this.generatePlayerStartPosition(floor);
      this.floors[floor].entityManager.add(floor, pos[0], pos[1], player);
    }
    else{
      console.log('floor does not exist');
    }
  }

  playerSkillAttack(player, coords, damage, range, splash, radial){
    if(player.dead)
      return;
    if(radial){
      var lis = this.floors[player.floor].entityManager.map.getWithinSquareRadius(player.x, player.y, {radius: range}).flat();
      lis.forEach(e => {
        if(e.type != 'player')
          player.skillAttack(e, damage);
      });
      return;
    }
    var entity = this.findTargetInRange(player, coords.x, coords.y, range);
    if(!entity)
      return;
    if(entity.type == 'player')
      return;
    player.skillAttack(entity, damage);
    if(splash){
      var lis = this.floors[player.floor].entityManager.map.getWithinSquareRadius(entity.x, entity.y).flat();
      lis.forEach(e => {
        if(e.type != 'player')
          player.skillAttack(e, damage);
      });
    }
  }
  playerStunAttack(player, coords, duration, range){
    var entity = this.findTargetInRange(player, coords.x, coords.y, range);
    if(!entity)
      return;
    if(entity.type == 'player')
      return;
    entity.stunCd = duration;
    var smash = {
      cd: Constants.DEFAULT_CD/2,
      source: player,
      type: 'attack',
      targetX: coords.x,
      targetY: coords.y,
      sourceX: player.x,
      sourceY: player.y
    };
    this.floors[player.floor].smashLayer.set(player.x, player.y, smash);
  }
  findTargetInRange(player, clickedX, clickedY, n) {
    var deltaX = Math.abs(clickedX - player.x);
    var deltaY = Math.abs(clickedY - player.y);
    var signX = player.x < clickedX ? 1 : -1;
    var signY = player.y < clickedY ? 1 : -1;
    let error = deltaX - deltaY;
  
    let x = player.x;
    let y = player.y;
    let tilesVisited = 0;
  
    while (x !== clickedX || y !== clickedY) {
      if (tilesVisited == n) 
        return null;
      tilesVisited++;
      const doubleError = 2 * error;
      // Determine the next step
      if (doubleError > -deltaY) {
        error -= deltaY;
        x += signX;
      }
      if (doubleError < deltaX) {
        error += deltaX;
        y += signY;
      }
      var entity = this.floors[player.floor].entityManager.getFirst(x, y);
      if(entity){
        if(entity.type != 'player')
          return entity;
      }
    }
    var clicked = this.floors[player.floor].entityManager.getFirst(clickedX, clickedY);
    if(clicked){
      if(clicked.type != 'player')
        return clicked;
    }
    return null;
  }

  // networking functions
  addPlayer(socket, name, job, discordId) {
    this.sockets[socket.id] = socket;

    // Generate a position to start this player at.
    let pos = this.generatePlayerStartPosition(1);
    var player = new Player(this, socket.id, name, job, pos[0], pos[1], discordId);
    this.players[socket.id] = player;
    this.floors[1].entityManager.add(1, pos[0], pos[1], player);
    player.sprite = job + '.png';
    
    // give starting skill
    var skill = null;
    switch(job){
      case 'knight': case 'knightess': skill = 'slash'; break;
      case 'warrior': case 'warrioress': skill = 'smash'; break;
      case 'mage': case 'sorceress': skill = 'fireball'; break;
      case 'ranger': case 'archeress': skill = 'far_shot'; break;
      case 'ninja': case 'kunoichi': skill = 'backstab'; break;
    }
    player.skills.push(new Skill(this, skill));
  }

  connectPlayer(socket, playerData) {
    this.sockets[socket.id] = socket;

    // // Generate a position to start this player at.
    let pos = this.generatePlayerStartPosition(1);
    var player = new Player(this, socket.id, playerData.name, playerData.job, pos[0], pos[1], playerData.discordId);
    this.players[socket.id] = player;
    player.loadSavedData(playerData);
    this.floors[1].entityManager.add(1, pos[0], pos[1], player);
    console.log('connecting player with id: ' + playerData.discordId);
  }
  // Function to add or update a player in the database
  addOrUpdatePlayer(playerData){
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database('./playerdata.db');

      const { discordId, ...fields } = playerData;

      // Extract field names and values from the player object
      const fieldNames = Object.keys(fields);
      const fieldValues = Object.values(fields);

      // Generate placeholders for the SQL statement
      const placeholders = fieldNames.map(() => '?').join(', ');

      // Generate the SQL statement dynamically
      const sql = `
        INSERT INTO players (discordId, ${fieldNames.join(', ')})
        VALUES (?, ${placeholders})
        ON CONFLICT(discordId) DO UPDATE SET ${fieldNames.map(field => `${field} = excluded.${field}`).join(', ')}
      `;

      // Execute the SQL statement with the playerData values
      db.run(sql, [discordId, ...fieldValues], (err) => {
        db.close(); // Close the database connection

        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  checkForCharacterUpdateOrRemoval(socket) {
    var player = this.players[socket.id];
    // no player session created yet (e.g. disconnected for discord login)
    if(!player){
      return;
    }
    if(player.discordId){
      this.addOrUpdatePlayer(player.exportSavedData())
        .then(() => {
          this.floors[player.floor].entityManager.remove(player);
          delete this.players[socket.id];
        })
        .catch((error) => {
          console.error('Error exporting player:', error);
        });
    }
    else{
      this.floors[player.floor].entityManager.remove(player);
      // delete this.players[socket.id];
    }
    delete this.sockets[socket.id];
  }

  handleInput(socket, action) {
    var player = this.players[socket.id];
    if (player) {
      if(player.dead)
        return;
      if(Constants.DIRECTIONS_4.indexOf(action) !== -1)
        player.queueMove(action);
    }
  }

  handleSkillInput(socket, coords) {
    var player = this.players[socket.id];
    if (player) {
      if(player.dead)
        return;
      var mapCoords = player.hoverToTileCoords(coords.x, coords.y);
        // tile = this.floors[player.floor].map.get(mapCoords.x, mapCoords.y);
      player.queueSkill(mapCoords);
      // console.log(mapCoords);
    }
  }

  handleMouseMapInput(socket, coords) {
    var player = this.players[socket.id];
    if(player){
      if (player.dead)
        return;
      var mapCoords = player.pixelToTileCoords(coords.x, coords.y),
          tile = this.floors[player.floor].map.get(mapCoords.x, mapCoords.y);
      if(!tile)
          return;
      if(mapCoords.x == player.x && mapCoords.y == player.y)
        return;
      var entity = this.floors[player.floor].entityManager.getFirst(mapCoords.x, mapCoords.y);
      if(entity){
        // in range and not player
        if(entity.type == 'player')
          return;
        var dist = getTileDistance(entity.x, entity.y, player.x, player.y);
        if ( dist <= player.weapon.range)
          player.queueAttack(entity);
        return;
      }
      var furniture = this.floors[player.floor].furnitureManager.getFirst(mapCoords.x, mapCoords.y);
      if(furniture){
        var dist = getTileDistance(furniture.x, furniture.y, player.x, player.y);
        if ( dist <= 1 && furniture.openable){
          // should be able to insta open things 
          player.open(furniture);
          return;
        }
        if ( dist <= player.weapon.range && furniture.attackable){
          player.queueAttack(furniture);
        }
        return;
      }
      // var item = this.itemManager.get(x, y);
      // if(item){
      //     result.push(item);
      // }
    }
  }

  handleMenuInput(socket, input){
    var player = this.players[socket.id];
    if(player){
      switch(input.type){
        case 'sort-inventory-type': player.inventory = this.sortInventoryByKey(player.inventory, 'group');return;
        case 'sort-inventory-name': player.inventory = this.sortInventoryByKey(player.inventory, 'name'); return;
        case 'sort-inventory-rarity': player.inventory = this.sortInventoryByKey(player.inventory, 'rank'); return;
        case 'sort-jobs-name': player.jobs = sortArrayOfObjects(player.jobs, 'name'); return;
        case 'sort-outfits-name': player.outfits = sortArrayOfObjects(player.outfits, 'name'); return;
        case 'sort-stats-type': player.stats = sortArrayOfObjects(player.stats, 'group'); return;
        case 'sort-stats-name': player.stats = sortArrayOfObjects(player.stats, 'name'); return;
        case 'sort-stats-rarity': player.stats = sortArrayOfObjects(player.stats, 'rank'); return;
        case 'sort-skills-rarity': player.skills = sortArrayOfObjects(player.skills, 'rank'); return;
        case 'sort-skills-name': player.skills = sortArrayOfObjects(player.skills, 'name'); return;
        case 'use-inventory': this.playerUseItem(player, input.index, socket); return;
        case 'use-shop': this.playerBuyItem(player, input.index, socket); return;
        case 'use-sell': this.playerSellItem(player, input.index, socket); return;
        case 'fuse-skills': this.playerFuseSkill(player, input.index, socket); return;
        case 'use-job': this.playerChangeJob(player, input.index, socket); return;
        case 'use-outfit': this.playerChangeOutfit(player, input.index, socket); return;
        case 'up-stat': this.playerIncreaseStat(player, input.stat); return;
        case 'respawn': this.playerRespawn(player); return;
      }
    }
  }

  effectUpdates(effectLayer){
    for(var x = effectLayer.width - 1; x >= 0; x--){
      for(var y = effectLayer.height - 1; y >= 0; y--){
          var val = effectLayer.get(x, y);
          if(val){
            if(val.cd > 0)
              val.cd--;
            else
              effectLayer.remove(x, y);
          }
      }
    }
  }

  // update game state 60 times per sec
  game_update(){
    var _this = this;
    Object.keys(_this.floors).forEach(floorNumber => {
      var floor = _this.floors[floorNumber];
      floor.entityManager.update();
      _this.effectUpdates(floor.smashLayer);
      _this.effectUpdates(floor.damageLayer);
      floor.furnitureManager.update();
      floor.map.update();
    });
  }

  // update all players of game state 30 times per sec
  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // this.entityManager.update();


    // Update each player
    // Object.keys(this.sockets).forEach(playerID => {
    //   const player = this.players[playerID];
    //   player.update();
    // });

    // Check if any players are dead
    // Object.keys(this.sockets).forEach(playerID => {
    //   const socket = this.sockets[playerID];
    //   const player = this.players[playerID];
    //   if (player.hp <= 0) {

    //     // player.sprite = 'tombstone.png';
    //     // bro idk about this
    //     // this.removeAndUpdatePlayer(socket);
    //   }
    // });

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  createUpdate(player) {
    // serializing all layers
    var floorNumber = player.floor;
    let tileLayer = this.floors[floorNumber].map.serializeMapAt(player.x, player.y);
    var base = [...Array(Constants.RENDER_SIZE)].map(e => Array(Constants.RENDER_SIZE));
    let furnitureLayer = this.floors[floorNumber].furnitureManager.serializeObjectsAt(player.x, player.y, base);
    let itemLayer = this.floors[floorNumber].itemManager.serializeObjectsAt(player.x, player.y, furnitureLayer);
    let spriteLayer = this.floors[floorNumber].entityManager.serializeObjectsAt(player.x, player.y, itemLayer);
    let smashLayer = this.serializeSmashLayerAt(floorNumber, player.x, player.y);
    let damageLayer = this.serializeDamageLayerAt(floorNumber, player.x, player.y);

    return {
      t: Date.now(),
      player: player.serializeForUpdate(),
      floor: floorNumber,
      map: tileLayer,
      sprites: spriteLayer,
      smash: smashLayer,
      damage: damageLayer,
      shop: this.serializeShop(),
      playerList: this.serializePlayerList(),
    };
  }
}

module.exports = Game;
