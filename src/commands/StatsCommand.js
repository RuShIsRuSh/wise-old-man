const Command = require('../Command');
const AsciiTable = require('ascii-table');
const request = require('request-promise');

class StatsCommand extends Command {
    constructor() {
        super('stats', {
            aliases: ['stats', 'hiscores', 'levels'],
            args: [
                {
                    id: 'name',
                    match: 'rest',
                    default: null
                }
            ],
            description: 'Returns hiscores for a specific player',
            usage: 'stats <player name>'
        });
    }

    getStats(user) {
        return request({
            uri: `http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(user)}`
        });
    }

    async exec(message, args) {
        if (!args.name) {
            return message.util.sendEmbed(this.getUsage(message.util.prefix));
        }

        const skills = ['Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer',
            'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing',
            'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction'];

        let data;

        try {
            data = await this.getStats(args.name);
        } catch (e) {
            return message.util.reply(`Player ${args.name} not found!`);
        }

        const stats = data.split(/[ \n]/g);

        const table = new AsciiTable(`Hiscores for ${args.name}`);
        table.setHeading('Skill', 'Rank', 'Level', 'XP');

        for (const i in skills) {
            const [rank, level, xp] = stats[i].split(',');
            table.addRow(skills[i], Number(rank).toLocaleString(), level, Number(xp).toLocaleString());
        }

        message.util.send(`\`${table.toString()}\``);
    }
}

module.exports = StatsCommand;
