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
                },
                {
                    id: 'skills',
                    match: 'prefix',
                    prefix: ['-skill=', '--skill=', '-skills=', '--skills=', '-s=', '--s=']
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

        let data;

        try {
            data = await this.getStats(args.name);
        } catch (e) {
            return message.util.reply(`Player ${args.name} not found!`);
        }

        const stats = data.split(/[ \n]/g);
        let skills = args.skills;

        if (skills && !Array.isArray(skills)) {
            skills = skills.split(/[,; ]/g);

            if (skills.length <= 0) {
                return message.util.reply('Invalid skills filter!');
            }
        }

        const table = new AsciiTable(`Hiscores for ${args.name}`);
        table.setHeading('Skill', 'Rank', 'Level', 'XP');

        this.client.gutils.findSkills(skills).forEach(skill => {
            const [skillName, skillId] = skill;
            const [rank, level, xp] = stats[skillId].split(',');
            table.addRow(skillName, Number(rank).toLocaleString(), level, Number(xp).toLocaleString());
        });

        message.util.send(`\`${table.toString()}\``);
    }
}

module.exports = StatsCommand;
