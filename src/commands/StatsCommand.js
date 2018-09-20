const Command = require('../Command');
const AsciiTable = require('ascii-table');
const request = require('request-promise');
const { findSkills, getHiscores, mapHiscores, getCombatLevel, possessive } = require('../Utils');

class StatsCommand extends Command {
    constructor() {
        super('stats', {
            aliases: ['stats', 'hiscores', 'combat', 'minigameStats'],
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
            usage: [
                'stats <player name>',
                'stats <player name> -skills=fishing,slayer'
            ]
        });
    }

    async getStats(data, message, args) {
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

        findSkills(skills).forEach(skill => {
            const [skillName, skillId] = skill;
            const [rank, level, xp] = stats[skillId].split(',');
            table.addRow(skillName, Number(rank).toLocaleString(), level, Number(xp).toLocaleString());
        });

        message.util.send(`\`${table.toString()}\``);
    }

    async getCombat(stats, message, args) {
        stats = mapHiscores(stats);
        let combat = getCombatLevel(stats);
        if (combat > 126) combat = 126;

        message.util.send(`**${args.name}**${possessive(args.name)} combat level is \`${combat}\``);
    }

    async getMinigameStats(stats, message, args) {
        stats = mapHiscores(stats).minigames;

        const table = new AsciiTable(`Minigame hiscores for ${args.name}`);
        table.setHeading('Minigame', 'Rank', 'Score');
        table.addRow('Clue scroll (easy)', stats.easy.rank, stats.easy.score);
        table.addRow('Clue scroll (medium)', stats.medium.rank, stats.medium.score);
        table.addRow('Clue scroll (hard)', stats.hard.rank, stats.hard.score);
        table.addRow('Clue scroll (elite)', stats.elite.rank, stats.elite.score);
        table.addRow('Clue scroll (master)', stats.master.rank, stats.master.score);
        table.addRow('Clue scroll (all)', stats.all.rank, stats.all.score);
        table.addRow('Bounty hunter', stats.bh.rank, stats.bh.score);
        table.addRow('Bounty hunter (rogues)', stats.bhrogues.rank, stats.bhrogues.score);
        table.addRow('Last Man Standing', stats.lms.rank, stats.lms.score);
        message.util.send(`\`${table.toString()}\``);
    }

    async exec(message, args) {
        if (!args.name) {
            args.name = this.client.links.get(message.author.id, 'rsn');
            if (!args.name) return message.util.sendEmbed(this.getUsage(message.util.prefix));
        }

        let data;
        try {
            data = await getHiscores(args.name);
        } catch (e) {
            return message.util.reply(`Player with args.name ${args.name} not found!`);
        }

        switch (message.util.alias) {
        case 'combat': {
            this.getCombat(data, message, args);
            break;
        }
        case 'minigameStats': {
            this.getMinigameStats(data, message, args);
            break;
        }
        default:
            this.getStats(data, message, args);
        }
    }
}

module.exports = StatsCommand;
