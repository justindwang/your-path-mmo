const Constants = require('../shared/constants');
const { merge, mapRankToColor } = require('../shared/util');

class Skill {
    constructor(game, type) {
        this.game = game;
        this.type = type;
        this.radial = false;
        this.splash = false;
        this.passive = false;
        this.duration = 0;
        this.maxCd = 0;

        var skillData = Constants.SKILL_TYPES[type];
        merge(this, skillData);
        this.color = mapRankToColor(this.rank);
    }
    serializeForMenuUpdate(){
        return {
            name: this.name,
            sprite: this.sprite,
            color: this.color,
            rank: this.rank,
            mpCost: this.mpCost,
            description: this.description,
        };
    }
    cast(player, coords){
        this.game.playerSkillAttack(player, coords, this.damage, this.range, this.splash, this.radial);
    }
}
module.exports = Skill;