const moment = require('moment');
const request = require('request-promise');

const { take, takeRight, last } = require('lodash');

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

exports.getCombatLevel = stats => {
    const base = 0.25 * (stats.defence.level + stats.hitpoints.level + Math.floor(stats.prayer.level / 2));
    const melee = 0.325 * (stats.attack.level + stats.strength.level);
    const range = 0.325 * (Math.floor(stats.ranged.level / 2) + stats.ranged.level);
    const mage = 0.325 * (Math.floor(stats.magic.level / 2) + stats.magic.level);
    return Math.floor((base + Math.max(melee, range, mage)) * 100) / 100;
};

exports.mapHiscores = hiscores => {
    hiscores = hiscores.split(/[ \n]/g);
    const obj = {};
    obj.minigames = {};

    const skillStats = take(hiscores, skills.length);
    const rest = takeRight(hiscores, hiscores.length - skills.length);

    skillStats.forEach((s, i) => {
        const [rank, level, xp] = s.split(',');
        obj[skills[i].toLowerCase()] = {
            rank: Number(rank),
            level: Number(level),
            xp: Number(xp)
        }
    });

    ['easy', 'medium', 'all', 'bh', 'bhrogues', 'hard', 'lms', 'elite', 'master'].forEach((key, i) => {
        const [rank, score] = rest[i].split(',');
        obj.minigames[key] = {
            rank: Number(rank),
            score: Number(score)
        };
    });

    return obj;
};

exports.possessive = name => {
    if (last(name) == 's') {
        return '\'';
    }
    return '\'s';
};

exports.getHiscores = user => {
    return request({
        uri: `http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(user)}`
    });
};

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
