const { COLORS, findNthTile } = require('./util');

var TICK_RATE = 20;

module.exports = Object.freeze({
  PLAYER_MAX_HP: 20,
  PLAYER_MAX_MP: 10,

  MAP_SIZE: 25,
  RENDER_SIZE: 10,
  TILE_SIZE: 60,
  TICK_RATE: 20,
  DEFAULT_CD: 20,

  MSG_TYPES: {
    NEW_PLAYER: 'new_player',
    GAME_UPDATE: 'update',
    LOG_MESSAGE: 'log_message',
    INPUT: 'input',
    MOUSE_MAP_INPUT: 'mouse_map_input',
    MENU_INPUT: 'menu_input',
    SKILL_INPUT: 'skill_input',
    AUTHENTICATE: 'authenticate',
    AUTHENTICATED: 'authenticated',
    RESPAWN: 'respawn',
  },
  MAP_CHAR_TO_TYPE: {
    '#': 'wall',
    '.': 'floor',
    'x': 'exit'
  },
  FLOOR_DATA: {
    1: {
        name: 'Rolling Meadows',
        entities: {
          '.': 0.747,
          'b': 0.2,
          's': 0.05,
          '-': 0.001,
          'g': 0.002,
        },
        entitySpawner: {
          slime: 0.96,
          goober: 0.04,
        },
        furnitureSpawner: {
          bush: 0.995, 
          crate: 0.005,
        },
        floorBgColor: COLORS.green,
        wallBgColor: COLORS.light_brown,
        entityCharToType: {
            s: 'slime',
            g: 'goober'},
        furnitureCharToType: {
            b: 'bush',
            '+': 'door',
            '-': 'crate',},
        itemsCharToType: {},
        crateLoot: {
            F: 0.4,
            E: 0.3,
            D: 0.25,
            C: 0.05
        }
    },
    2: {
        name: 'Verdant Forest',
        entities: {
            '.': 0.649,
            'm': 0.2,
            'T': 0.1,
            'w': 0.05,
            '-': 0.001
        },
        entitySpawner: {
          wolf: 1,
        },
        furnitureSpawner: {
          leaf_pile: 0.664, 
          oak_tree: 0.332,
          crate: 0.004,
        },
        floorBgColor: COLORS.forest_green,
        wallBgColor: COLORS.oak_brown,  
        entityCharToType: {
            w: 'wolf',},
        furnitureCharToType: {
            m: 'leaf_pile',
            '+': 'door',
            T: 'oak_tree',
            '-': 'crate',},
        itemsCharToType: {},
        crateLoot: {
            F: 0.4,
            E: 0.3,
            D: 0.25,
            C: 0.05
        }
    },
    3: {
        name: 'Goblin Caverns',
        entities: {
            '.': 0.593,
            'g': 0.05,
            'b': 0.15,
            'm': 0.1,
            'w': 0.1,
            's': 0.005,
            'k': 0.001,
            '-': 0.001
        },
        entitySpawner: {
          goblin: 0.995,
          goblin_king: 0.005,
        },
        furnitureSpawner: {
          boulder: 0.421,
          mud: 0.28,
          puddle: 0.28,
          mushroom: 0.014,
          crate: 0.005,
        },
        floorBgColor: COLORS.cave_floor,
        wallBgColor: COLORS.cave_wall,
        entityCharToType: {
            g: 'goblin',
            k: 'goblin_king',},
        furnitureCharToType: {
            b: 'boulder',
            '+': 'door',
            m: 'mud',
            w: 'puddle',
            '-': 'crate',},
        itemsCharToType: {
            s: 'mushroom',
        },
        crateLoot: {
            F: 0.4,
            E: 0.3,
            D: 0.25,
            C: 0.05
        }
    },
    4: {
        name: 'Salty Flats',
        entities: {
            '.': 0.649,
            'r': 0.05,
            's': 0.2,
            'g': 0.1,
            '-': 0.001
        },
        entitySpawner: {
          rock_snail: 1,
        },
        furnitureSpawner: {
          salt: 0.6,
          gravel: 0.395,
          crate: 0.005,
        },
        floorBgColor: COLORS.salt_floor,
        wallBgColor: COLORS.salt_wall,
        entityCharToType: {
            r: 'rock_snail',},
        furnitureCharToType: {
            s: 'salt',
            '+': 'door',
            g: 'gravel',
            '-': 'crate',},
        itemsCharToType: {},
        crateLoot: {
            F: 0.2,
            E: 0.4,
            D: 0.3,
            C: 0.1
        }
    },
  },
  ENTITY_TYPES: {
    slime: {
        name: 'Slime',
        sprite: 'slime.png',
        consoleColor: COLORS.blue,
  
        maxTurnsWithoutStumble: 3,
        hp: 10,
        hpMax: 10,
        strength: 1,
        exp: 2,
        aggroRange: 0,
        initialize: function() {
            // this.weapon = new RL.Item(this.game, 'goo');
            // this.applyWeaponStats(this.weapon);
            // RL.Actions.Resolvable.add(this, 'attack');
  
            // RL.Actions.Performable.add(this, 'attack');
  
        },
        loot: {
            nothing: 0.5,
            monster_shard: 0.5,
        },
    },
    goober: {
      name: 'Goober',
      sprite: 'goober.png',

      maxTurnsWithoutStumble: 2,
      hp: 30,
      hpMax: 30,
      strength: 4,
      exp: 5,
      aggroRange: 0,
      initialize: function() {
          // this.weapon = new RL.Item(this.game, 'goo');
          // this.applyWeaponStats(this.weapon);
          // RL.Actions.Resolvable.add(this, 'attack');

          // RL.Actions.Performable.add(this, 'attack');

      },
      loot: {
          monster_shard: 1,
      },
  },
    wolf: {
      name: 'Wolf',
      sprite: 'wolf.png',
      consoleColor: COLORS.dark_gray,
      maxTurnsWithoutStumble: 10,
      hp: 30,
      hpMax: 30,
      strength: 3,
      exp: 10,
      aggroRange: 2,
      initialize: function() {
          // this.weapon = new RL.Item(this.game, 'wolf_fang');
          // this.applyWeaponStats(this.weapon);
          // RL.Actions.Resolvable.add(this, 'attack');

          // RL.Actions.Performable.add(this, 'attack');
      },
      loot: {
          nothing: 0.5,
          monster_shard: 0.45,
          wolf_fang: 0.05
      },
    },
    goblin: {
      name: 'Goblin',
      sprite: 'goblin.png',
      consoleColor: COLORS.green,
      maxTurnsWithoutStumble: 15,
      hp: 50,
      hpMax: 50,
      strength: 5,
      exp: 20,
      aggroRange: 3,
      initialize: function() {
          // this.weapon = new RL.Item(this.game, 'rusty_dagger');
          // RL.Actions.Resolvable.add(this, 'attack');

          // RL.Actions.Performable.add(this, 'attack');
      },
      loot: {
          nothing: 0.5,
          monster_shard: 0.3,
          rusty_dagger: 0.15,
          coin_stash: 0.05
      },
    },
    goblin_king: {
      name: 'Goblin King',
      sprite: 'goblin_king.png',
      consoleColor: COLORS.dark_green,
      maxTurnsWithoutStumble: 10,
      hp: 100,
      hpMax: 100,
      strength: 10,
      exp: 100,
      aggroRange: 0,
      initialize: function() {
          // this.weapon = new RL.Item(this.game, 'kings_resent');
          // RL.Actions.Resolvable.add(this, 'attack');

          // RL.Actions.Performable.add(this, 'attack');
      },
      loot: {
          kings_resent: 0.5,
          coin_stash: 0.5
      },
    },
    rock_snail: {
        name: 'Rock Snail',
        sprite: 'rock_snail.png',
        consoleColor: COLORS.green,
        maxTurnsWithoutStumble: 2,
        hp: 60,
        hpMax: 60,
        strength: 10,
        exp: 40,
        aggroRange: 1,
        initialize: function() {
            // this.weapon = new RL.Item(this.game, 'rusty_dagger');
            // RL.Actions.Resolvable.add(this, 'attack');
  
            // RL.Actions.Performable.add(this, 'attack');
        },
        loot: {
            nothing: 0.3,
            monster_shard: 0.7,
        },
      },
  },
  FURNITURE_TYPES: {
    door: {
        name: 'Door',
        hp: 5,
        sprite: 'door.png',
        consoleColor: COLORS.yellow,
        passable: false,
        blocksLos: true,
        attackable: false,
        pushable: false,
        openable: true,
        mixins: ['door'],
        // init: function(){
        //     RL.Actions.Resolvable.add(this, 'open');
        //     RL.Actions.Resolvable.add(this, 'close');
        // }
    },
    crate: {
        name: 'Crate',
        hp: 5,
        sprite: 'crate.png',
        consoleColor: COLORS.yellow,
        pushable: false,
        passable: false,
        blocksLos: false,
        attackable: false,
        pushable: false,
        openable: true,
        // init: function(){
        //     RL.Actions.Resolvable.add(this, 'open');
        // }
    },
    // Added by rio
    bush: {
        name: 'Bush',
        hp: 1,
        sprite: 'bush.png',
        consoleColor: COLORS.green,
        pushable: true,
        passable: false,
        blocksLos: false,
        attackable: true,
        pushable: true,
        // init: function(){
        //     RL.Actions.Resolvable.add(this, 'push');
        //     RL.Actions.Resolvable.add(this, 'attack');
        // }
    },

    leaf_pile: {
        name: 'Leaf Pile',
        hp: 5,
        sprite: 'leaf_pile.png',
        consoleColor: COLORS.green,
        pushable: false,
        passable: true,
        blocksLos: false,
        attackable: true,
        pushable: false,
        // init: function(){
        //     RL.Actions.Resolvable.add(this, 'attack');
        // }
    },
    oak_tree:{
        name: 'Oak Tree',
        hp: 15,
        sprite: 'oak_tree.png',
        consoleColor: COLORS.golden_oak,
        pushable: false,
        passable: false,
        blocksLos: true,
        attackable: true,
        pushable: false,
        // init: function(){
        //     RL.Actions.Resolvable.add(this, 'attack');
        // }
    },
    boulder:{
        name: 'Boulder',
        hp: 30,
        sprite: 'boulder.png',
        consoleColor: COLORS.gray,
        pushable: false,
        passable: false,
        blocksLos: true,
        attackable: true,
        pushable: false,
        // init: function(){
        //     RL.Actions.Resolvable.add(this, 'attack');
        // }
    },
    mud:{
        name: 'Mud',
        hp: 1,
        sprite: 'mud.png',
        consoleColor: COLORS.brown,
        pushable: false,
        passable: true,
        blocksLos: false,
        attackable: true,
        pushable: false,
        // init: function(){
        // }
    },
    puddle:{
        name: 'Puddle',
        hp: 1,
        sprite: 'puddle.png',
        consoleColor: COLORS.dirty_water,
        pushable: false,
        passable: false,
        blocksLos: false,
        attackable: true,
        pushable: false,
        // init: function(){
        //     RL.Actions.Resolvable.add(this, 'attack');
        // }
    },
    salt:{
        name: 'Salt',
        hp: 50,
        sprite: 'salt.png',
        consoleColor: COLORS.dirty_water,
        pushable: false,
        passable: false,
        blocksLos: false,
        attackable: true,
        pushable: false,
        // init: function(){
        //     RL.Actions.Resolvable.add(this, 'attack');
        // }
    },
    gravel:{
        name: 'Gravel',
        hp: 1,
        sprite: 'gravel.png',
        consoleColor: COLORS.dirty_water,
        pushable: false,
        passable: true,
        blocksLos: false,
        attackable: true,
        pushable: false,
        // init: function(){
        //     RL.Actions.Resolvable.add(this, 'attack');
        // }
    },
    
  },
  OUTFIT_TYPES: {
    casual_hoodie: {
        name: 'Casual Hoodie',
        sprite: 'casual_hoodie.png',
        description: 'warm and comfy',
    },
    casual_blouse: {
        name: 'Casual Blouse',
        sprite: 'casual_blouse.png',
        description: 'comes with cute frills',
    },
    // assignable classes
    keikogi: {
        name: 'Keikogi',
        sprite: 'kendoka.png',
        description: 'made with simple fabrics',
    },
    hooded_cloak: {
        name: 'Hooded Cloak',
        sprite: 'ivory_reaper.png',
        description: 'mysterious but stylish',
    },
    floral_armor: {
        name: 'Floral Armor',
        sprite: 'flower_fighter.png',
        description: 'a sweet fragrance follows',
    },
    midnight_cloak: {
        name: 'Midnight Cloak',
        sprite: 'black_swordsman.png',
        description: 'just a little edgy',
    },
    daopao: {
        name: 'Daopao',
        sprite: 'archery_disciple.png',
        description: 'plain and respectful',
    },
    tiny_dress: {
        name: 'Tiny Dress',
        sprite: 'preschooler.png',
        description: 'handpicked with love',
    },
    patterned_kimono: {
        name: 'Patterned Kimono',
        sprite: 'kitsune.png',
        description: 'beautifully woven',
    },
    work_suit: {
        name: 'Work Suit',
        sprite: 'businessman.png',
        description: 'perfectly ironed',
    },
    lofty_dress: {
        name: 'Lofty Dress',
        sprite: 'battle_maid.png',
        description: 'orderly and spotless',
    },
    autumn_dress: {
        name: 'Autumn Dress',
        sprite: 'enchantress.png',
        description: 'colorful and dazzling',
    },
    
    // base classes
    silver_armor: {
        name: 'Silver Armor',
        sprite: 'knight.png',
        description: 'basic protection',
    },
    cobalt_armor: {
        name: 'Cobalt Armor',
        sprite: 'knightess.png',
        description: 'basic protection',
    },
    trusty_chainmail: {
        name: 'Trusty Chainmail',
        sprite: 'warrior.png',
        description: 'capable of taking hits',
    },
    leather_chainmail: {
        name: 'Leather Chainmail',
        sprite: 'warrioress.png',
        description: 'capable of taking hits',
    },
    green_rags: {
        name: 'Green Rags',
        sprite: 'ranger.png',
        description: 'blends with the forest',
    },
    flowy_rags: {
        name: 'Flowy Rags',
        sprite: 'archeress.png',
        description: 'blends with the forest',
    },
    blue_robe: {
        name: 'Blue Robe',
        sprite: 'mage.png',
        description: 'a magician\'s staple',
    },
    purple_robe: {
        name: 'Purple Robe',
        sprite: 'sorceress.png',
        description: 'a magician\'s staple',
    },
    ninja_gear: {
        name: 'Ninja Gear',
        sprite: 'ninja.png',
        description: 'for hiding in shadows',
    },
    black_haori: {
        name: 'Black Haori',
        sprite: 'kunoichi.png',
        description: 'for hiding in shadows',
    },
  },
  TILE_TYPES: {
    floor: {
        name: 'Floor',
        color: COLORS.green,
        bgColor: COLORS.green,
        passable: true,
        blocksLos: false
    },
    wall: {
        name: 'Wall',
        color: COLORS.light_brown,
        bgColor: COLORS.light_brown,
        passable: false,
        blocksLos: true
    },
    exit: {
        name: 'Exit',
        bgColor: COLORS.green,
        sprite: 'exit.png',
        consoleColor: COLORS.red_alt,
        passable: true,
        blocksLos: false,
        // onEntityEnter: function(entity){
        //     // if(this.game.player !== entity)
        //     //     return;
        //     // this.game.console.logExitReached(entity);
        //     // var y_n_exit = {
        //     //     next_floor: ['Y'],
        //     //     same_floor: ['N'],};
        //     // this.game.input.addBindings(y_n_exit);
            

        // }
    }
  },
  JOB_TYPES: {
    // assignable classes
    kendoka: {
        name: 'Kendoka',
        sprite: 'kendoka.png',
        description: 'simple and steadfast',
        outfit: 'keikogi',
        equipEffect: function(player) {
            player.learnSkill(new RL.Skill(this.game, 'zen_strike'));
        },
        unequipEffect: function(player){
            this.game.player.forgetSkill('zen_strike');
        },
    },
    ivory_reaper: {
        name: 'Ivory Reaper',
        sprite: 'ivory_reaper.png',
        description: 'ominous and menacing',
        outfit: 'hooded_cloak',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'final_cut'));
        },
        unequipEffect: function(){
            this.game.player.forgetSkill('final_cut');
        },
    },
    flower_fighter: {
        name: 'Flower Fighter',
        sprite: 'flower_fighter.png',
        description: 'graceful and vibrant',
        outfit: 'floral_armor',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'photosynthesis'));
        },
        unequipEffect: function(){
            this.game.player.forgetSkill('photosynthesis');
        },
    },
    black_swordsman: {
        name: 'Black Swordsman',
        sprite: 'black_swordsman.png',
        description: 'skilled and battle-tested',
        outfit: 'midnight_cloak',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'evade'));
        },
        unequipEffect: function(){
            this.game.player.forgetSkill('evade');
        },
    },
    archery_disciple: {
        name: 'Archery Disciple',
        sprite: 'archery_disciple.png',
        description: 'eager and sharp',
        outfit: 'daopao',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'qi_shot'));
        },
        unequipEffect: function(){
            this.game.player.forgetSkill('qi_shot');
        },
    },
    preschooler: {
        name: 'Preschooler',
        sprite: 'preschooler.png',
        description: 'playful and energetic',
        outfit: 'tiny_dress',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'temper_tantrum'));
        },
        unequipEffect: function(){
            this.game.player.forgetSkill('temper_tantrum');
        },
    },
    kitsune: {
        name: 'Kitsune',
        sprite: 'kitsune.png',
        description: 'mischievous and wise',
        outfit: 'patterned_kimono',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'foxfire'));
        },
        unequipEffect: function(){
            this.game.player.forgetSkill('foxfire');
        },
    },
    businessman: {
        name: 'Businessman',
        sprite: 'businessman.png',
        description: 'hardworking and professional',
        outfit: 'work_suit',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'cash_flow'));
        },
        unequipEffect: function(){
            this.game.player.forgetSkill('cash_flow');
        },
    },
    battle_maid: {
        name: 'Battle Maid',
        sprite: 'battle_maid.png',
        description: 'reliable and thorough',
        outfit: 'lofty_dress',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'clean_finish'));
        },
        unequipEffect: function(){
            this.game.player.forgetSkill('clean_finish');
        },
    },
    enchantress: {
        name: 'Enchantress',
        sprite: 'enchantress.png',
        description: 'mystical and alluring',
        outfit: 'autumn_dress',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'embrace'));
        },
        unequipEffect: function(){
            this.game.player.forgetSkill('embrace');
        },
    },
    
    // base classes
    knight: {
        name: 'Knight',
        sprite: 'knight.png',
        description: 'trustworthy and noble',
        outfit: 'silver_armor',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'slash'));
        },
        unequipEffect: function(){
        },
    },
    knightess: {
        name: 'Knightess',
        sprite: 'knightess.png',
        description: 'fearless and gentle',
        outfit: 'cobalt_armor',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'slash'));
        },
        unequipEffect: function(){
        },
    },
    warrior: {
        name: 'Warrior',
        sprite: 'warrior.png',
        description: 'cheerful and durable',
        outfit: 'trusty_chainmail',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'smash'));
        },
        unequipEffect: function(){
        },
    },
    warrioress: {
        name: 'Warrioress',
        sprite: 'warrioress.png',
        description: 'brave and dependable',
        outfit: 'leather_chainmail',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'smash'));
        },
        unequipEffect: function(){
        },
    },
    ranger: {
        name: 'Ranger',
        sprite: 'ranger.png',
        description: 'keen and accurate',
        outfit: 'green_rags',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'far_shot'));
        },
        unequipEffect: function(){
        },
    },
    archeress: {
        name: 'Archeress',
        sprite: 'archeress.png',
        description: 'swift and majestic',
        outfit: 'flowy_rags',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'far_shot'));
        },
        unequipEffect: function(){
        },
    },
    mage: {
        name: 'Mage',
        sprite: 'mage.png',
        description: 'witty and resourceful',
        outfit: 'blue_robe',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'fireball'));
        },
        unequipEffect: function(){
        },
    },
    sorceress: {
        name: 'Sorceress',
        sprite: 'sorceress.png',
        description: 'young and curious',
        outfit: 'purple_robe',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'fireball'));
        },
        unequipEffect: function(){
        },
    },
    ninja: {
        name: 'Ninja',
        sprite: 'ninja.png',
        description: 'silent and deadly',
        outfit: 'ninja_gear',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'backstab'));
        },
        unequipEffect: function(){
        },
    },
    kunoichi: {
        name: 'Kunoichi',
        sprite: 'kunoichi.png',
        description: 'patient and agile',
        outfit: 'black_haori',
        equipEffect: function() {
            this.game.player.learnSkill(new RL.Skill(this.game, 'backstab'));
        },
        unequipEffect: function(){
        },
    },
  },
  SKILL_TYPES: {
    // class skills
    zen_strike: {
        name: 'Zen Strike',
        adj: 'Zen',
        noun: 'Strike',
        sprite: 'zen_strike.png',
        rank: 'B',  
        description: '1.5k medium-range damage',
        maxCd: TICK_RATE * 7,
        range: 2,
        damage: 1500,
        mpCost: 20,
    },
    final_cut: {
        name: 'Final Cut',
        adj: 'Final',
        noun: 'Cut',
        sprite: 'final_cut.png',
        rank: 'S',
        description: '15k close-range damage',
        maxCd: TICK_RATE * 15,
        range: 1,
        damage: 15000,
        mpCost: 50,
    },
    photosynthesis: {
        name: 'Photosynthesis',
        adj: 'Sunny',
        noun: 'Light',
        sprite: 'photosynthesis.png',
        rank: 'A',
        description: 'Heals HP based on lighting',
        maxCd: TICK_RATE * 10,
        mpCost: 25,
        // mpCost: 1,
        cast: function(player, coords) {
          var healAmount = Math.floor(this.game.floors[player.floor].lighting.get(player.x, player.y)[0]/100 * 0.5 * player.hpMax);
          player.heal(healAmount);
        },
    },
    evade: {
        name: 'Evade',
        adj: 'Evading',
        noun: 'Evasion',
        sprite: 'evade.png',
        rank: 'C',
        description: 'Dodges the next attack',
        maxCd: TICK_RATE * 10,
        mpCost: 10,
        cast: function(player, coords) {
          player.dodges = 1;
        },
    },
    // qi_shot: {
    //     name: 'Qi Shot',
    //     sprite: 'qi_shot',
    //     rank: 'Unique',
    //     description: 'Deal 100% Luck damage to 3 targets within 2 tiles',
    //     mpCost: 10,
    //     performEffect: function() {
    //         this.game.player.multiSkillAttack(this, this.game.player.luck * 2, 2, 3);
    //     },
    // },
    // temper_tantrum: {
    //     name: 'Temper Tantrum',
    //     sprite: 'temper_tantrum',
    //     rank: 'Unique',
    //     description: 'Deal 1 to 50 damage in a 2 tile radius',
    //     mpCost: 5,
    //     performEffect: function() {
    //         this.game.player.selfAoeSkillAttack(this, RL.Util.random(1,50), 2);
    //     },
    // },
    // foxfire: {
    //     name: 'Foxfire',
    //     sprite: 'foxfire',
    //     rank: 'Unique',
    //     description: 'Deal 150% Intelligence damage to 5 targets within 3 tiles',
    //     mpCost: 20,
    //     performEffect: function() {
    //         this.game.player.multiSkillAttack(this, Math.ceil(this.game.player.intelligence * 1.5), 3, 5);
    //     },
    // },
    // cash_flow: {
    //     name: 'Cash Flow',
    //     sprite: 'cash_flow',
    //     rank: 'Unique',
    //     description: 'Obtain 1 to 100 gold',
    //     mpCost: 10,
    //     performEffect: function() {
    //         var gold = RL.Util.random(1,100);
    //         this.game.player.gold += gold;
    //         this.game.console.log(this.game.console.wrap(this.game.player) + ' gained ' + gold + ' gold');
    //     },
    // },
    // clean_finish: {
    //     name: 'Clean Finish',
    //     sprite: 'clean_finish',
    //     rank: 'Unique',
    //     description: 'Deal 200% Agility damage to an enemy within 1 tile',
    //     mpCost: 5,
    //     performEffect: function() {
    //         this.game.player.skillAttack(this, this.game.player.agility * 2, 1);
    //     },
    // },
    embrace: {
        name: 'Embrace',
        adj: 'Embracing',
        noun: 'Embrace',
        sprite: 'embrace.png',
        rank: 'A',
        description: 'Medium-range 3 second stun',
        maxCd: TICK_RATE * 12,
        mpCost: 20,
        range: 2,
        duration: TICK_RATE * 3,
        cast: function(player, coords) {
          this.game.playerStunAttack(player, coords, this.duration, this.range);
        },
    },
    quick_heal: {
      name: 'Quick Heal',
      adj: 'Healing',
      noun: 'Heal',
      sprite: 'quick_heal.png',
      rank: 'E',
      description: '10 hp self heal',
      maxCd: TICK_RATE * 10,
      mpCost: 10,
      cast: function(player, coords) {
        player.heal(10);
      },
      
  },
    // test skills
    // pancake_torch: {
    //     name: 'Pancake Torch',
    //     sprite: 'evade',
    //     rank: 'B',
    //     description: 'Heals half of one\'s HP immediately',
    //     mpCost: 20,
    //     performEffect: function() {
    //         this.game.player.heal(Math.floor(this.game.player.hpMax/2));
    //     },
        
    // },
    // powerbuff_gorl: {
    //     name: 'Powerbuff Gorl',
    //     sprite: 'evade',
    //     rank: 'B',
    //     description: 'Increases strength stat by 1~10',
    //     mpCost: 20,
    //     performEffect: function() {
    //         this.game.player.statChange('strength', RL.Util.random(1,10));
    //     },
    // },
    // on hit passives
    vampiric: {
        name: 'Vampiric',
        adj: 'Vampiric',
        noun: 'Vampire',
        sprite: 'vampiric.png',
        rank: 'C',
        description: 'Passive chance to heal on hit',
        passive: true,
        // performOnHit: function() {
        //     if(RL.Util.random(0,1)==1){
        //         this.game.player.hp += 1;
        //         if(this.game.player.hp > this.game.player.hpMax)
        //             this.game.player.hp = this.game.player.hpMax;
        //         RL.Util.arrFind(this.game.menu.stats, 'hp_healed').incrementBy(1);
        //     }
        // },
        onHit: function(player, target) {
          if(Math.random() < 0.5)
            player.heal(1);
        },
    },
    // intuition: {
    //     name: 'Intuition',
    //     sprite: 'intuition',
    //     rank: 'C',
    //     description: 'Passive - Chance to restore 1 mp on hit',
    //     mpCost: 0,
    //     passive: true,
    //     performOnHit: function() {
    //         if(RL.Util.random(0,1)==1){
    //             this.game.player.mp += 1;
    //             if(this.game.player.mp > this.game.player.mpMax)
    //                 this.game.player.mp = this.game.player.mpMax;
    //             RL.Util.arrFind(this.game.menu.stats, 'mp_restored').incrementBy(1);
    //         }
    //     },
    // },
    // golden_touch: {
    //     name: 'Golden Touch',
    //     sprite: 'golden_touch',
    //     rank: 'C',
    //     description: 'Passive - Chance to earn 1 gold on hit',
    //     mpCost: 0,
    //     passive: true,
    //     performOnHit: function() {
    //         if(RL.Util.random(0,1)==1){
    //             this.game.player.gold += 1;
    //             RL.Util.arrFind(this.game.menu.stats, 'gold_earned').incrementBy(1);
    //         }
    //     },
    // },
    // base skills
    slash: {
        name: 'Slash',
        adj: 'Slashing',
        noun: 'Slash',
        sprite: 'slash.png',
        rank: 'F',
        description: '15 close-range damage',
        maxCd: TICK_RATE * 2,
        range: 1,
        damage: 15,
        mpCost: 2,
    },
    smash: {
        name: 'Smash',
        adj: 'Smashing',
        noun: 'Smash',
        sprite: 'smash.png',
        rank: 'F',
        description: '10 close-range radial damage',
        maxCd: TICK_RATE * 2,
        range: 1,
        damage: 10,
        radial: true,
        mpCost: 2,
    },
    far_shot: {
        name: 'Far Shot',
        adj: 'Far',
        noun: 'Shot',
        sprite: 'far_shot.png',
        rank: 'F',
        description: '13 medium-range damage',
        maxCd: TICK_RATE * 2,
        range: 2,
        damage: 13,
        mpCost: 2,
    },
    fireball: {
        name: 'Fireball',
        adj: 'Flaming',
        noun: 'Fireball',
        sprite: 'fireball.png',
        rank: 'F',
        description: '10 medium-range splash damage',
        maxCd: TICK_RATE * 2,
        range: 2,
        damage: 10,
        splash: true,
        mpCost: 2,
    },
    backstab: {
        name: 'Backstab',
        adj: 'Flanking',
        noun: 'Backstab',
        sprite: 'backstab.png',
        rank: 'F',
        description: '20 close-range damage',
        maxCd: TICK_RATE * 3,
        range: 1,
        damage: 20,
        mpCost: 2,
    },
    haste: {
      name: 'Haste',
      adj: 'Hasty',
      noun: 'Haste',
      sprite: 'haste.png',
      rank: 'E',
      description: 'Small agi boost for 5 seconds',
      maxCd: TICK_RATE * 10,
      range: 1,
      mpCost: 5,
      cast: function(player, coords) {
        var amount = Math.floor(Math.max(player.agility * 0.1, 1));
        player.agility += amount;
        setTimeout(
          function() {
            player.agility -= amount;
          }, 5000);
      }
    },
    //
    bouncy: {
      name: 'Bouncy',
      adj: 'Bouncy',
      noun: 'Bounce',
      sprite: 'bouncy.png',
      rank: 'F',
      description: 'Does nothing',
      maxCd: TICK_RATE * 0.5,
      range: 1,
      mpCost: 5,
      cast: function(player, coords) {
        return;
      }
    },
    tunnel: {
      name: 'Tunnel',
      adj: 'Tunneling',
      noun: 'Tunnel',
      sprite: 'tunnel.png',
      rank: 'F',
      description: 'Tunnels 2 tiles away',
      maxCd: TICK_RATE * 5,
      range: 1,
      mpCost: 5,
      cast: function(player, coords) {
        var dest = findNthTile(player.x, player.y, coords.x, coords.y, 2);
        if(this.game.entityCanMoveTo(player, player.floor, dest.x, dest.y,)){
          this.game.floors[player.floor].entityManager.move(dest.x, dest.y, player);
        }
      }
    },
    rock_armor: {
      name: 'Rock Armor',
      adj: 'Rock',
      noun: 'Armor',
      sprite: 'rock_armor.png',
      rank: 'F',
      description: 'Light shielding for 5 seconds',
      maxCd: TICK_RATE * 10,
      range: 1,
      mpCost: 5,
      cast: function(player, coords) {
        player.damageReduction += 0.1;
        setTimeout(
          function() {
            player.damageReduction -= 0.1;
          }, 5000);
      }
    },
    salt_spray: {
      name: 'Salt Spray',
      adj: 'Salty',
      noun: 'Spray',
      sprite: 'salt_spray.png',
      rank: 'F',
      description: '10 medium-range splash damage',
      maxCd: TICK_RATE * 1,
      range: 2,
      damage: 5,
      mpCost: 2,
  },
    chomp: {
      name: 'Chomp',
      adj: 'Viscious',
      noun: 'Chomp',
      sprite: 'chomp.png',
      rank: 'F',
      description: '35 close-range damage',
      maxCd: TICK_RATE * 3,
      range: 1,
      damage: 35,
      mpCost: 5,
  },

    // fillin spells to cover ranks
    // slice: {
    //     name: 'Slice',
    //     sprite: 'slice.png',
    //     rank: 'E',
    //     description: 'Deal 100% Agi and Str Dmg (Range: 1)',
    //     mpCost: 5,
    //     performEffect: function() {
    //         this.game.player.skillAttack(this, this.game.player.strength + this.game.player.agility, 1);
    //     },
    // },
    // triple_shot: {
    //     name: 'Triple Shot',
    //     sprite: 'evade',
    //     rank: 'D',
    //     description: 'Deal 50% Luck Dmg (Range: 2, Targets: 3)',
    //     mpCost: 8,
    //     performEffect: function() {
    //         this.game.player.multiSkillAttack(this, Math.ceil(this.game.player.luck * 0.5), 2, 3);
    //     },
    // },
    // shockwave: {
    //     name: 'Shockwave',
    //     rank: 'C',
    //     description: 'Deal 150% Vit Dmg (Range: 3)',
    //     mpCost: 12,
    //     performEffect: function() {
    //         this.game.player.selfAoeSkillAttack(this, Math.ceil(this.game.player.vitality * 1.5), 3);
    //     },
    // },
    // lightning_bolt: {
    //     name: 'Lightning Bolt',
    //     sprite: 'evade',
    //     rank: 'A',
    //     description: 'Deal 200% Int Dmg (Range: 3)',
    //     mpCost: 30,
    //     performEffect: function() {
    //         this.game.player.skillAttack(this, Math.ceil(this.game.player.intelligence * 2), 3);
    //     },
    // },
    burst_blade: {
        name: 'Burst Blade',
        adj: 'Burst',
        noun: 'Blade',
        sprite: 'burst_blade.png',
        rank: 'S',
        description: '10k close-range damage',
        maxCd: TICK_RATE * 10,
        range: 1,
        damage: 10000,
        mpCost: 100,
    },
    
  },
  DIRS: {
		"4": [
			[ 0, -1],
			[ 1,  0],
			[ 0,  1],
			[-1,  0]
		],
		"8": [
			[ 0, -1],
			[ 1, -1],
			[ 1,  0],
			[ 1,  1],
			[ 0,  1],
			[-1,  1],
			[-1,  0],
			[-1, -1]
		],
		"6": [
			[-1, -1],
			[ 1, -1],
			[ 2,  0],
			[ 1,  1],
			[-1,  1],
			[-2,  0]
		]
	},
  DIRECTIONS_4: [
    'up',
    'down',
    'left',
    'right'
  ],
  KEY_BINDINGS: {
    up: ['↑', 'W'],
    down: ['↓', 'S'],
    left: ['←', 'A'],
    right: ['→', 'D'],
    skill: ['E'],
    // skill: ['R'],
  },
  KEYCODE_BINDINGS: {
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    65: "left",
    68: "right",
    69: "skill",
    // 82: "skill",
    83: "down",
    87: "up",
  }
});
