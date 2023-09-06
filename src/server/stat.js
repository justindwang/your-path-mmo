const {merge, mapRankToColor } = require('../shared/util');

var makeCounterStat = function(obj){
    return merge(obj, Defaults.counter);
};

var Defaults = {
    counter: {
        count: 0,
        increment: function(){
            this.count++;
        },
        incrementBy: function(amount){
            this.count += amount;
        },
        getStats: function(){
            return this.count;
        },
    },
};
var STAT_TYPES = {
    tiles_traveled: makeCounterStat({
        name: 'Tiles Traveled',
        group: 'misc',
        rank: 'F',
    }),
    crates_opened: makeCounterStat({
        name: 'Crates Opened',
        group: 'misc',
        rank: 'F',
    }),
    enemies_killed: makeCounterStat({
        name: 'Enemies Killed',
        group: 'combat',
        rank: 'F',
    }),
    objects_destroyed: makeCounterStat({
        name: 'Objects Destroyed',
        group: 'combat',
        rank: 'F',
    }),
    weapons_collected: makeCounterStat({
        name: 'Weapons Collected',
        group: 'combat',
        rank: 'F',
    }),
    hp_healed: makeCounterStat({
        name: 'HP Healed',
        group: 'healing',
        rank: 'E'
    }),
    mp_restored: makeCounterStat({
        name: 'MP restored',
        group: 'healing',
        rank: 'E'
    }),
    skills_used: makeCounterStat({
        name: 'Skills Used',
        group: 'misc',
        rank: 'E'
    }),
    gold_earned: makeCounterStat({
        name: 'Gold Earned',
        group: 'misc',
        rank: 'E'
    }),
};

class Stat {
    constructor(game, key) {
        this.game = game;
        this.key = key;
        this.type = null;
        this.show = true;
        this.group = null;
        this.count = null;
        var typeData = STAT_TYPES[key];
        merge(this, typeData);
        this.color = mapRankToColor(this.rank);
    }
    getClass(){
        return 'stat';
    }
    serializeForMenuUpdate(){
        return {
            name: this.name,
            rank: this.rank,
            count: this.count,
            group: this.group,
        };
    }
    serializeForExport(){
        return {
            count: this.count,
        } 
    }
}
module.exports = {Stat: Stat, STAT_TYPES: STAT_TYPES};