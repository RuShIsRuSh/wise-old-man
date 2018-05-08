const moment = require('moment');
const request = require('request-promise');

const skills = ['Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer',
    'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing',
    'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction'];

exports.skills = skills;

exports.findSkill = q => {
    return skills.find((skill, index) => {
        if (!isNaN(q) && q == index) return true;
        q = q.toLowerCase().replace(/[^a-z]/g, '');
        return !!skill.toLowerCase().match(q, 'i');
    });
}
;
// if 'skills' is ['fish', 'str'], the function will return [['Strength', 3], ['Fishing', 11]]
exports.findSkills = filter => {
    const formattedSkills = skills.map((skill, i) => {
        return [skill, i];
    });

    if (!filter || (filter && !Array.isArray(filter))) {
        return formattedSkills;
    }

    const clone = [...filter];

    return formattedSkills
    .filter(skill => {
        return clone.find((needle, i) => {
            if (skill[0] == this.findSkill(needle)) {
                clone.splice(i, 1);
                return true;
            }

            return false;
        });
    });
};

exports.getHiscores = user => {
    return request({
        uri: `http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(user)}`
    });
}

exports.secondsToReadable = seconds => {
    return moment().subtract(seconds, 'seconds').fromNow();
};

exports.formatNumber = num => {
    return Number(num).toLocaleString();
};

exports.formatNumberWithSign = num => {
    num = Number(num);
    let str = num.toLocaleString();
    if (num > 0) {
        str = `+${str}`;
    }
    return str;
};
