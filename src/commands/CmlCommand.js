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
                }
            ],
            description: 'All things related to [Crystal Math Labs!](http://crystalmathlabs.com)',
            usage: [
                'cml update <player name>',
                'cml ehp <player name> --s=slayer,attack',
                'cml records <player name> --s=slayer,attack',
                'cml ttm <player name>'
            ]
        });
    }

    callApi(type, player) {
        return request(`http://crystalmathlabs.com/tracker/api.php?type=${type}&player=${encodeURIComponent(player)}`);
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

    async getTimeTillMax(message, username) {
        const ttm = await this.callApi('ttm', username);
        const status = this.getReturnStatus(ttm);
        if (status) {
            return message.reply(`CML returned an error: ${status}`);
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
            return message.reply(`CML returned an error: ${status}`);
        }

        switch (parseInt(response)) {
        case 1:
            return message.channel.send(`Successfully updated \`${username}\``);
        case 2:
            return message.channel.send(`Player \`${username}\` was not found on RuneScape hiscores`);
        case 3:
            return message.channel.send('Error: Negative XP gain detected');
        case 4:
            return message.channel.send('Error: Unknown');
        case 5:
            return message.channel.send(`Player \`${username}\` has already been updated within the last 30 seconds`);
        case 6:
            return message.channel.send(`Error: Player name \`${username}\` is invalid`);
        }
    }

    async getRecords(message, username, skills) {
        let stats = await this.callApi('recordsofplayer', username);

        const status = this.getReturnStatus(stats);
        if (status) {
            return message.reply(`CML returned an error: ${status}`);
        }

        stats = stats.split(/[ \n]/g);

        if (!Array.isArray(skills)) {
            skills = skills.split(/[,; ]/g);
        }

        const table = new AsciiTable(`CML Experience records for ${username}`);
        table.setHeading('Skill', 'Day', 'Week', 'Month');

        for (const i in this.client.gutils.skills) {
            const [dayRecord, _dayRecordTime, weekRecord, _weekRecordTime, monthRecord, _monthRecordTime] = stats[i].split(',');

            if (skills) {
                for (const s of skills) {
                    const test = new RegExp(s, 'i');

                    if (this.client.gutils.skills[i].match(test)) {
                        table.addRow(this.client.gutils.skills[i], Number(dayRecord).toLocaleString(), Number(weekRecord).toLocaleString(), Number(monthRecord).toLocaleString());
                        break;
                    }
                }

                continue;
            }

            table.addRow(this.client.gutils.skills[i], Number(dayRecord).toLocaleString(), Number(weekRecord).toLocaleString(), Number(monthRecord).toLocaleString());
        }

        message.util.send(`\`${table.toString()}\``);
    }

    async getEhp(message, username, skills) {
        let stats = await this.callApi('trackehp', username);

        const status = this.getReturnStatus(stats);
        if (status) {
            return message.reply(`CML returned an error: ${status}`);
        }

        stats = stats.split(/[ \n]/g);

        if (!Array.isArray(skills)) {
            skills = skills.split(/[,; ]/g);
        }

        const lastUpdated = stats.shift();

        const table = new AsciiTable(`CML EHP for ${username}`);
        table.setHeading('Skill', 'XP', 'Rank', 'EHP');

        for (const i in this.client.gutils.skills) {
            const [statsXP, statsRank, _statsXPLatest, _statsRankLatest, statsEHP] = stats[i].split(',');

            if (skills) {
                for (const s of skills) {
                    const test = new RegExp(s, 'i');

                    if (this.client.gutils.skills[i].match(test)) {
                        table.addRow(
                            this.client.gutils.skills[i],
                            this.client.gutils.formatNumberWithSign(statsXP),
                            this.client.gutils.formatNumberWithSign(statsRank),
                            statsEHP);
                        break;
                    }
                }

                continue;
            }

            table.addRow(
                this.client.gutils.skills[i],
                this.client.gutils.formatNumberWithSign(statsXP),
                this.client.gutils.formatNumberWithSign(statsRank),
                statsEHP);
        }

        message.util.send(`\`${table.toString()}\`\n\n*(Last updated ${lastUpdated} seconds ago)*`);
    }

    exec(message, args) {
        console.log(args);
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
            this.getEhp(message, args.player, args.skills);
            break;
        }
    }
}

module.exports = CmlCommand;
