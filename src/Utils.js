module.exports = class Utils {
    constructor(client) {
        this.client = client;
    }

    get skills() {
        return ['Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer',
            'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing',
            'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction'];
    }

    findSkill(q) {
        return this.skills.find((skill, index) => {
            if (!isNaN(q) && q == index) return true;
            q = q.toLowerCase().replace(/[^a-z]/g, '');
            return !!skill.toLowerCase().match(q, 'i');
        });
    }

    // if 'skills' is ['fish', 'str'], the function will return [['Strength', 3], ['Fishing', 11]]
    findSkills(skills) {
        const formattedSkills = this.skills
        .map((skill, i) => {
            return [skill, i];
        });

        if (!skills || (skills && !Array.isArray(skills))) {
            return formattedSkills;
        }

        const clone = [...skills];

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
    }

    formatNumber(num) {
        return Number(num).toLocaleString();
    }

    formatNumberWithSign(num) {
        num = Number(num);
        let str = num.toLocaleString();
        if (num > 0) {
            str = `+${str}`;
        }
        return str;
    }
};
