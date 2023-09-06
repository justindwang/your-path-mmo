const Constants = require('../shared/constants');
const { merge } = require('../shared/util');

class Job {
    constructor(type) {
        this.type = type;
        this.strengthGrowth = 0;
        this.intelligenceGrowth = 0;
        this.vitalityGrowth = 0;
        this.agilityGrowth = 0;
        this.luckGrowth = 0;

        var jobData = Constants.JOB_TYPES[type];
        merge(this, jobData);
    }
    serializeForMenuUpdate(){
        return {
            name: this.name,
            sprite: this.sprite,
            description: this.description,
        };
    }
}
module.exports = Job;