const { merge, mapRankToColor, selectRandomElement, arrFind } = require('../shared/util');
const Constants = require('../shared/constants');
const Job = require('./job');
const Outfit = require('./outfit');
const Skill = require('./skill');

var makeHealingItem = function(obj){
    return merge(obj, Defaults.healing);
};

var makeMpRecoveryItem = function(obj){
    return merge(obj, Defaults.mp_recovery);
};

var makeWeapon = function(obj){
    return merge(obj, Defaults.weapon);
};

var makeMaterial = function(obj){
    return merge(obj, Defaults.material);
};
var makeSpecialItem = function(obj){
    return merge(obj, Defaults.special);
};
var makeSkillScroll = function(obj){
    return merge(obj, Defaults.skill_scroll);
};
var makeMiscItem = function(obj){
    return merge(obj, Defaults.misc);
};

var Defaults = {
    healing: {
        group: 'healing',
        getConsoleName: function(){
            return {
                name: this.name,
                color: this.color
            };
        },
        getStats: function(){
            return 'Heals ' + this.healAmount + ' HP';
        },
    },
    mp_recovery: {
        group: 'mp_recovery',
        getConsoleName: function(){
            return {
                name: this.name,
                color: this.color
            };
        },
        getStats: function(){
            return 'Recovers ' + this.healAmount + ' MP';
        },
    },
    skill_scroll: {
        group: 'skill_scroll',
        attachTo: function(entity){
            // this.game.console.logAddToInventory(entity, this);
            // this.game.menu.addToInventory(this);
            // RL.Util.arrFind(this.game.menu.stats, 'skill_scrolls_obtained').increment();
        },
        getConsoleName: function(){
            return {
                name: this.name,
                rank: this.rank,
                stats: this.getStats(),
                color: this.color,
                sprite: this.sprite,
            };
        },
        getStats: function(){
            return 'Teaches ' + this.skillName;
        },
    },
    weapon: {
        group: 'weapon',
        attachTo: function(entity){
            // this.game.console.logAddToInventory(entity, this);
            // this.game.menu.addToInventory(this);
            // RL.Util.arrFind(this.game.menu.stats, 'weapons_collected').increment();
        },
        getConsoleName: function(){
            return {
                name: this.name,
                rank: this.rank,
                stats: this.getStats(),
                range: this.range,
                color: this.color,
                sprite: this.sprite,
            };
        },
        getStats: function(){
            var msg = '';
            if(this.stat1){
                if(this.stat1Modifier >= 0)
                    msg += '+';
                else
                    msg += '-';
                msg += this.stat1Modifier + ' ' + this.stat1;
            }
            if(this.stat2){
                msg += ', ';
                if(this.stat2Modifier >= 0)
                    msg += '+';
                else
                    msg += '-';
                msg += this.stat2Modifier + ' ' + this.stat2;
            }
            if(this.stat3){
                msg += ', ';
                if(this.stat3Modifier >= 0)
                    msg += '+';
                else
                    msg += '-';
                msg += this.stat3Modifier + ' ' + this.stat3;
            }
            return msg;
        },
    },
    material: {
        group: 'material',
        // sprite: 'material.png',
        getStats: function(){
            return 'Material';
        },
        getConsoleName: function(){
            return {
                name: this.name,
                stats: this.getStats(),
                color: this.color
            };
        },
    },
    special: {
        group: 'special',
        unsellable: 'true',
        // sprite: 'material.png',
        getConsoleName: function(){
            return {
                name: this.name,
                stats: this.getStats(),
                color: this.color
            };
        },
    },
    misc: {
        group: 'misc',
        getConsoleName: function(){
            return {
                name: this.name,
                stats: this.getStats(),
                color: this.color
            };
        },
    },
};

var ITEM_TYPES = {
    // revive items
    soulstone: {
        group: 'revive',
        name: 'Soulstone',
        sprite: 'soulstone.png',
        rank: 'B',
        healAmount: 1,
        cost: 5000,
        getStats: function(){
            return 'Revives players with 1 HP';
        },
    },
    // healing items
    tiny_hp_potion: makeHealingItem({
        name: 'Tiny HP Potion',
        sprite: 'hp_potion.png',
        rank: 'F',
        healAmount: 10,
        cost: 10,
    }),
    tiny_mp_potion: makeMpRecoveryItem({
        name: 'Tiny MP Potion',
        sprite: 'mp_potion.png',
        rank: 'F',
        healAmount: 5,
        cost: 10,
    }),
    mushroom: makeHealingItem({
        name: 'Mushroom',
        sprite: 'mushroom.png',
        rank: 'F',
        healAmount: 3,
        cost: 5,
    }),
    hp_potion: makeHealingItem({
        name: 'HP Potion',
        sprite: 'hp_potion.png',
        rank: 'E',
        healAmount: 100,
        cost: 75,
    }),

    // enemy weapons
    // goo: makeWeapon({
    //     name: 'Goo',
    //     sprite: 'slime_goo.png',
    //     rank: 'F',
    //     stat1: 'Str',
    //     stat1Modifier: 1,
    //     range: 1,
    //     cost: 10,
    // }),
    wolf_fang: makeWeapon({
        name: 'Wolf Fang',
        sprite: 'wolf_fang.png',
        rank: 'E',
        stat1: 'Str',
        stat2: 'Agi',
        stat1Modifier: 2,
        stat2Modifier: 2,
        range: 1,
        cost: 110,
    }),
    rusty_dagger: makeWeapon({
        name: 'Rusty Dagger',
        sprite: 'rusty_dagger.png',
        rank: 'F',
        stat1: 'Agi',
        stat1Modifier: 1,
        range: 1,
        cost: 10,
    }),
    kings_resent: makeWeapon({
        name: 'King\'s Resent',
        sprite: 'kings_resent.png',
        rank: 'C',
        stat1: 'Str',
        stat2: 'Vit',
        stat1Modifier: 10,
        stat2Modifier: 5,
        range: 1,
        cost: 1000
    }),

    // melee weapons
    fists: makeWeapon({
        name: 'Fists',
        sprite: 'fists.png',
        rank: 'F',
        // stat1: 'Str',
        // stat1Modifier: 0,
        range: 1,
        cost: 5,
    }),
    wooden_sword: makeWeapon({
        name: 'Wooden Sword',
        sprite: 'wooden_sword.png',
        rank: 'F',
        stat1: 'Str',
        stat1Modifier: 2,
        range: 1,
        cost: 20,
    }),
    wooden_shield: makeWeapon({
        name: 'Wooden Shield',
        sprite: 'wooden_shield.png',
        rank: 'F',
        stat1: 'Vit',
        stat1Modifier: 2,
        range: 1,
        cost: 20,
    }),

    copper_dagger: makeWeapon({
        name: 'Copper Dagger',
        sprite: 'copper_dagger.png',
        rank: 'F',
        stat1: 'Str',
        stat1Modifier: 1,
        stat2: 'Agi',
        stat2Modifier: 1,
        range: 1,
        cost: 20,
    }),

    // ranged weapons
    sharp_rock: makeWeapon({
        name: 'Sharp Rock',
        sprite: 'sharp_rock.png',
        rank: 'F',
        stat1: 'Str',
        stat2: 'Luck',
        stat1Modifier: 1,
        stat2Modifier: 1,
        range: 2,
        cost: 20,
    }),

    javelin: makeWeapon({
        name: 'Javelin',
        sprite: 'javelin.png',
        rank: 'F',
        stat1: 'Luck',
        stat1Modifier: 2,
        range: 2,
        cost: 20,
    }),

    nails: makeWeapon({
        name: 'Nails',
        sprite: 'nails.png',
        rank: 'F',
        stat1: 'Agi',
        stat1Modifier: 1,
        range: 3,
        cost: 20,
    }),

    twig: makeWeapon({
        name: 'Twig',
        sprite: 'twig.png',
        rank: 'F',
        stat1: 'Int',
        stat1Modifier: 2,
        range: 2,
        cost: 20,
    }),

    // material
    monster_shard: makeMaterial({
        name: 'Monster Shard',
        sprite: 'monster_shard.png',
        rank: 'F',
        cost: 20,
    }),

    slime_goo: makeMaterial({
        name: 'Slime Goo',
        sprite: 'slime_goo.png',
        rank: 'F',
        cost: 10,
    }),

    wolf_fur: makeMaterial({
        name: 'Wolf Fur',
        sprite: 'wolf_fur.png',
        rank: 'F',
        cost: 50,
    }),

    coin_stash: makeMaterial({
        name: 'Coin Stash',
        sprite: 'coin_stash.png',
        rank: 'E',
        cost: 200,
    }),

    // skill scrolls
    bouncy_skill_scroll: makeSkillScroll({
        name: 'Skill Scroll',
        skillName: 'Bouncy',
        skillType: 'bouncy',
        sprite: 'skill_scrollF.png',
        rank: 'F',
        cost: 50,
    }),
    chomp_skill_scroll: makeSkillScroll({
        name: 'Skill Scroll',
        skillName: 'Chomp',
        skillType: 'chomp',
        sprite: 'skill_scrollE.png',
        rank: 'E',
        cost: 200,
    }),
    // skill_scrollD: makeSkillScroll({
    //     name: 'Skill Scroll',
    //     sprite: 'skill_scrollD.png',
    //     rank: 'D',
    //     cost: 600,
    // }),
    // skill_scrollC: makeSkillScroll({
    //     name: 'Skill Scroll',
    //     sprite: 'skill_scrollC.png',
    //     rank: 'C',
    //     cost: 1200,
    // }),
    // skill_scrollB: makeSkillScroll({
    //     name: 'Skill Scroll',
    //     sprite: 'skill_scrollB.png',
    //     rank: 'B',
    //     cost: 2400,
    // }),
    // skill_scrollA: makeSkillScroll({
    //     name: 'Skill Scroll',
    //     sprite: 'skill_scrollA.png',
    //     rank: 'A',
    //     cost: 6000,
    // }),
    // skill_scroll_S: makeSkillScroll({
    //     name: 'Skill Scroll',
    //     sprite: 'skill_scrollS.png',
    //     rank: 'S',
    //     cost: 12000,
    // }),
    // misc items
    job_change_ticket: makeMiscItem({
        name: 'Job Change Ticket',
        sprite: 'job_change_ticket.png',
        rank: 'S',
        cost: 1000,
        getStats: function(){
            return 'Assigns a new job';
        },
        performUse: function(player, socket){
            var pool = [];
            for (const [key, value] of Object.entries(Constants.JOB_TYPES)) {
                pool.push(key);
            }
            var jobName = selectRandomElement(pool);
            var newJob = new Job(jobName);
            if (newJob.type == player.job.type || arrFind(player.jobs, 'type', newJob.type)){
                socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'inventory', message: '- Obtained duplicate job ' + newJob.name + ' -'});
            }
            else{
                player.jobs.push(newJob);
                var newOutfit = new Outfit(newJob.outfit);
                player.outfits.push(newOutfit);
                player.skills.push(new Skill(this.game, newJob.skill));
                socket.emit(Constants.MSG_TYPES.LOG_MESSAGE, {type:'inventory', message: '- ' +newJob.name+ ' added to jobs -<br>- '+ newOutfit.name + ' added to outfits -'});
            }
        },
    }),
    // special items
    ascension_crystal: makeSpecialItem({
        name: 'Ascension Crystal',
        sprite: 'ascension_crystal.png',
        rank: 'A',
        cost: 0,
        getStats: function(){
            return 'For traversing floors';
        },
        performUse: function(player, socket){
            this.game.playerChangeFloor(player, player.floor + 1);
        },
    }),

    descension_crystal: makeSpecialItem({
        name: 'Descension Crystal',
        sprite: 'descension_crystal.png',
        rank: 'A',
        cost: 0,
        getStats: function(){
            return 'For traversing floors';
        },
        performUse: function(player, socket){
            this.game.playerChangeFloor(player, player.floor - 1);
        },
    }),

    // fillin rank items
    stinger: makeWeapon({
        name: 'Stinger',
        sprite: 'stinger.png',
        rank: 'D',
        stat1: 'Str',
        stat1Modifier: 5,
        stat2: 'Agi',
        stat2Modifier: 2,
        range: 1,
        cost: 500,
    }),
    secret_rocks: makeMaterial({
        name: 'Secret Rocks',
        rank: 'B',
        cost: 2000,
    }),
    desolation: makeWeapon({
        name: 'Desolation',
        sprite: 'desolation.png',
        rank: 'B',
        stat1: 'Vit',
        stat1Modifier: 75,
        stat2: 'Str',
        stat2Modifier: 10,
        range: 1,
        cost: 2000,
    }),
    whip_of_fortune: makeWeapon({
        name: 'Whip of Fortune',
        sprite: 'whip_of_fortune.png',
        rank: 'A',
        stat1: 'Str',
        stat1Modifier: 100,
        stat2: 'Int',
        stat2Modifier: 50,
        range: 3,
        cost: 5000,
    }),
    barans_blades: makeWeapon({
        name: 'Baran\'s Blades',
        sprite: 'barans_blades.png',
        rank: 'S',
        stat1: 'Str',
        stat1Modifier: 220,
        stat2: 'Agi',
        stat2Modifier: 100,
        range: 1,
        cost: 10000,
    }),
    excalibur: makeWeapon({
        name: 'Excalibur',
        sprite: 'excalibur.png',
        rank: 'S',
        stat1: 'Str',
        stat1Modifier: 400,
        range: 1,
        cost: 15000,
    }),
    heavens_arrow: makeWeapon({
        name: 'Heaven\'s Arrow',
        sprite: 'heavens_arrow.png',
        rank: 'S',
        stat1: 'Str',
        stat1Modifier: 50,
        range: 5,
        cost: 15000,
    }),
}

class Item {
    constructor(game, type, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.rank = 'F';
        this.cost = 0;

        this.stat1 = null;
        this.stat2 = null;
        this.stat3 = null;

        this.stat1Modifier = null;
        this.stat2Modifier = null;
        this.stat3Modifier =  null;

        this.range = null;
        this.healAmount = null;

        this.unsellable = false;

        this.type = type;
        var typeData = ITEM_TYPES[type];
        merge(this, typeData);
        this.color = mapRankToColor(this.rank);
    }
    canAttachTo(entity){
        return entity.type == 'player';
    }
    attachTo(entity){
        // this.game.console.logAddToInventory(entity, this);
        // this.game.addToInventory(entity, this);
    }
    getClass(){
        return 'item';
    }

    // for map building
    serializeForUpdate(){
        return {
            sprite: this.sprite,
        };
    }
    // for rendering menu ui
    serializeForMenuUpdate(amount){
        return {
            name: this.name,
            sprite: this.sprite,
            color: this.color,
            rank: this.rank,
            cost: this.cost,
            range: this.range,
            stats: this.getStats(),
            amount: amount,
            unsellable: this.unsellable,
        };
    }
}
module.exports = {Item: Item, ITEM_TYPES: ITEM_TYPES};