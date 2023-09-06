const Constants = require('../shared/constants');
const { serializeArray, sortedArrayOfObjectsCopy, mapRankToColor } = require('../shared/util');
const Skill = require('./skill');

class FusedSkill {
    constructor(player){
        this.player = player;
        this.list = [];
        this.name = null;
        this.mpCost = null;
        this.rank = null;
        this.color = null;
        this.currCd = 0;
        this.maxCd = 0;
    }

    add(skill){
        this.list.push(skill);
        if(this.list.length > this.player.skillSlots)
            this.list.shift();
        var sortedFusedSkill = sortedArrayOfObjectsCopy(this.list, 'rank');
        if (sortedFusedSkill.length > 1)
            this.name = sortedFusedSkill[1].adj + ' ' + sortedFusedSkill[0].noun;
        else
            this.name = sortedFusedSkill[0].name;
        
        this.mpCost = this.averageMp();
        this.rank = this.averageRank();
        this.maxCd = this.averageCd();
        this.color = mapRankToColor(this.rank);
    }
    averageRank() {
        const rankMapping = { F: 1, E: 2, D: 3, C: 4, B: 5, A: 6, S: 7 };
        const reverseRankMapping = { 1: 'F', 2: 'E', 3: 'D', 4: 'C', 5: 'B', 6: 'A', 7: 'S' };
        const rankSum = this.list.reduce((sum, skill) => sum + rankMapping[skill.rank], 0);
        return reverseRankMapping[Math.round(rankSum / this.list.length)];
    }
    averageMp() {
        if (this.list.length === 0) {
          return 0;
        }
        var actives = this.getActiveSkills();
        if(actives.length == 0)
            return 0;
        const manaSum = actives.reduce((sum, skill) => sum + skill.mpCost, 0);
        return Math.round(manaSum / actives.length);
    }
    averageCd() {
        if (this.list.length === 0) {
          return 0;
        }
        var actives = this.getActiveSkills();
        if(actives.length == 0)
            return 0;
        const cdSum = actives.reduce((sum, skill) => sum + skill.maxCd, 0);
        return Math.round(cdSum / actives.length);
    }
    cast(coords) {
        for(var i = 0; i < this.list.length; i++){
            if(!this.list[i].passive)
                this.list[i].cast(this.player, coords);
        }
    }
    performOnHits(target){
        for(var i = 0; i < this.list.length; i++){
            if(this.list[i].onHit)
                this.list[i].onHit(this.player, target);
        }
    }
    serializeForMenuUpdate(){
        return {
            name: this.name,
            list: serializeArray(this.list),
            rank: this.rank,
            color: this.color,
            mpCost: this.mpCost,
            cd: Math.round(this.maxCd / Constants.TICK_RATE * 10) / 10, // rounding to 1 decimal place
            currCd: this.currCd,
            maxCd: this.maxCd,
        };
    }
    load(fusedSkillString){
        var arr = JSON.parse(fusedSkillString);
        for(var s = 0; s < arr.length; s++){
            this.add(new Skill(this.player.game, arr[s]));
        }
    }
    getActiveSkills(){
        var lis = [];
        for(var i = 0; i < this.list.length; i++){
            if(!this.list[i].passive)
                lis.push(this.list[i]);
        }
        return lis;
    }
}
module.exports = FusedSkill;