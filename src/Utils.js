module.exports = class Utils {
    constructor(client) {
        this.client = client;
    }

    get skills() {
        return ['Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer',
            'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing',
            'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction'];
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
