const Command = require('../Command');
const AsciiTable = require('ascii-table');
const request = require('request-promise');

class CmlCommand extends Command {
    constructor() {
        super('cml', {
            aliases: ['cml', 'crystal'],
            args: [
                {
                    id: 'action',
                    type: ['records', 'ttm', 'ehp', 'update'],
                    default: 'records'
                },
                {
                    id: 'player',
                    match: 'rest'
                },
                {
                    id: 'skills',
                    match: 'prefix',
                    prefix: ['-skill=', '--skill=', '-skills=', '--skills=', '-s=', '--s=']
                },
                {
                    id: 'time',
                    match: 'prefix',
                    prefix: ['-time', '--time=', '-t=', '--t='],
                    default: 'week'
                }
            ],
            description: 'All things related to [Crystal Math Labs!](http://crystalmathlabs.com)',
            usage: [
                'cml update <player name>',
                'cml ehp <player name> -s=<fishing,slayer...> -t=<day|week|year|all|20d|number_in_seconds>',
                'cml records <player name> -s=<attack,strength,defence...>',
                'cml ttm <player name>'
            ]
        });
    }

    callApi(type, player, additional = '') {
        return request({
            uri: `http://crystalmathlabs.com/tracker/api.php?type=${type}&player=${encodeURIComponent(player)}${additional}`,
            simple: false
        });
    }

    getReturnStatus(data) {
        if (Array.isArray(data) && data.length > 0) {
            data = data[0];
        }

        if (!isNaN(data) && Number(data) < 0) {
            data = Number(data);
            switch (data) {
            case -1:
                return 'User not in database';
            case -2:
                return 'Invalid username';
            case -3:
                return 'Database error';
            case -4:
                return 'Server under heavy load';
            }
        }

        return null;
    }

    getTime(arg) {
        switch (arg) {
        case 'day':
            return '1d';
        case 'week':
            return '7d';
        case 'month':
            return '31d';
        case 'year':
            return '365d';
        case 'all':
            return 'all';
        default:
            if (!isNaN(arg) || arg.match(/[0-9]{1,5}d/g)) {
                return arg;
            }

            return null;
        }
    }

    async getTimeTillMax(message, username) {
        const ttm = await this.callApi('ttm', username);
        const status = this.getReturnStatus(ttm);
        if (status) {
            return message.util.reply(`CML returned an error: ${status}`);
        }

        if (ttm == '-1') {
            return message.util.send(`Player **${username}** not found in cml database. Try running: \`cml update ${username}\``);
        }

        message.util.send(`Time till max stats for **${username}** is \`${ttm} hours\``);
    }

    async update(message, username) {
        const response = await this.callApi('update', username);
        const status = this.getReturnStatus(response);

        if (status) {
            return message.util.reply(`CML returned an error: ${status}`);
        }

        switch (parseInt(response)) {
        case 1:
            return message.util.send(`Successfully updated \`${username}\``);
        case 2:
            return message.util.send(`Player \`${username}\` was not found on RuneScape hiscores`);
        case 3:
            return message.util.send('Error: Negative XP gain detected');
        case 4:
            return message.util.send('Error: Unknown');
        case 5:
            return message.util.send(`Player \`${username}\` has already been updated within the last 30 seconds`);
        case 6:
            return message.util.send(`Error: Player name \`${username}\` is invalid`);
        }
    }

    async getRecords(message, username, skills) {
        let stats = await this.callApi('recordsofplayer', username);

        const status = this.getReturnStatus(stats);
        if (status) {
            return message.util.reply(`CML returned an error: ${status}`);
        }

        stats = stats.split(/[ \n]/g);

        if (!Array.isArray(skills)) {
            skills = skills.split(/[,; ]/g);
        }

        if (skills.length <= 0) {
            return message.util.reply('Invalid skills filter!');
        }

        const table = new AsciiTable(`CML Experience records for ${username}`);
        table.setHeading('Skill', 'Day', 'Week', 'Month');

        this.client.gutils.findSkills(skills).forEach(skill => {
            const [skillName, skillId] = skill;
            const [dayRecord, _dayRecordTime, weekRecord, _weekRecordTime, monthRecord, _monthRecordTime] = stats[skillId].split(',');
            table.addRow(skillName, Number(dayRecord).toLocaleString(), Number(weekRecord).toLocaleString(), Number(monthRecord).toLocaleString());
        });

        message.util.send(`\`${table.toString()}\``);
    }

    async getEhp(message, username, skills, time) {
        let timeStr = '';
        let timeFooter = 'Time period: week';

        if (time) {
            if (this.getTime(time)) {
                timeFooter = `Time period: ${this.getTime(time)}`;
                timeStr = `&time=${this.getTime(time)}`;
            } else {
                timeFooter = 'Invalid time period. Falling back to: week';
            }
        }

        let stats = await this.callApi('trackehp', username, timeStr);

        const status = this.getReturnStatus(stats);
        if (status) {
            return message.reply(`CML returned an error: ${status}`);
        }

        stats = stats.split(/[ \n]/g);

        if (!Array.isArray(skills)) {
            skills = skills.split(/[,; ]/g);
        }

        if (skills.length <= 0) {
            return message.util.reply('Invalid skills filter!');
        }

        const lastUpdated = stats.shift();

        const table = new AsciiTable(`CML EHP for ${username}`);
        table.setHeading('Skill', 'XP', 'Rank', 'EHP');

        this.client.gutils.findSkills(skills).forEach(skill => {
            const [skillName, skillId] = skill;
            const [statsXP, statsRank, _statsXPLatest, _statsRankLatest, statsEHP] = stats[skillId].split(',');
            table.addRow(
                skillName,
                this.client.gutils.formatNumber(statsXP),
                this.client.gutils.formatNumberWithSign(statsRank * -1),
                statsEHP);
        });

        message.util.send(`\`${table.toString()}\`\n\n*(Last updated ${lastUpdated} seconds ago)*\n(*${timeFooter}*)`);
    }

    exec(message, args) {
        switch (args.action) {
        case 'records':
            if (!args.player) {
                return message.util.sendEmbed(this.getUsage(message.util.prefix));
            }

            this.getRecords(message, args.player, args.skills);
            break;
        case 'ttm':
            this.getTimeTillMax(message, args.player);
            break;
        case 'update':
            this.update(message, args.player);
            break;
        case 'ehp':
            this.getEhp(message, args.player, args.skills, args.time);
            break;
        }
    }
}

module.exports = CmlCommand;
