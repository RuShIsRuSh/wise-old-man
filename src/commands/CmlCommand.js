const Command = require('../Command');
const AsciiTable = require('ascii-table');
const request = require('request-promise');

class CmlCommand extends Command {
    constructor() {
        super('cml', {
            aliases: ['cml'],
            args: [
                {
                    id: 'action',
                    type: ['records', 'ttm', 'update'],
                    default: 'records'
                },
                {
                    id: 'player',
                    match: 'rest'
                }
            ]
        });
    }

    callApi(type, player) {
        return request(`http://crystalmathlabs.com/tracker/api.php?type=${type}&player=${encodeURIComponent(player)}`);
    }

    handleReturnStatus(data) {
        if (!isNaN(data) && Number(data) < 0) {
            switch (data) {
            case '-1':
                return 'User not in database';
            case '-2':
                return 'Invalid username';
            case '-3':
                return 'Database error';
            case '-4':
                return 'Server under heavy load';
            }
        }

        return null;
    }

    async getTimeTillMax(message, username) {
        const ttm = await this.callApi('ttm', username);
        const status = this.handleReturnStatus(ttm);
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
        const status = this.handleReturnStatus(response);

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

    async getRecords(message, username, showSkills) {
        let stats = await this.callApi('recordsofplayer', username);

        const status = this.handleReturnStatus(stats);
        if (status) {
            return message.reply(`CML returned an error: ${status}`);
        }

        stats = stats.split(/[ \n]/g);

        const table = new AsciiTable(`CML Experience records for ${username}`);
        table.setHeading('Skill', 'Day', 'Week', 'Month');

        for (const i in this.client.gutils.skills) {
            const [dayRecord, _dayRecordTime, weekRecord, _weekRecordTime, monthRecord, _monthRecordTime] = stats[i].split(',');

            if (showSkills) {
                for (const s of showSkills) {
                    const test = new RegExp(s, 'i');

                    if (this.client.gutils.skills[i].match(test)) {
                        table.addRow(this.client.gutils.skills[i], Number(dayRecord).toLocaleString(), Number(weekRecord).toLocaleString(), Number(monthRecord).toLocaleString());
                    }
                }

                continue;
            }

            table.addRow(this.client.gutils.skills[i], Number(dayRecord).toLocaleString(), Number(weekRecord).toLocaleString(), Number(monthRecord).toLocaleString());
        }

        message.util.send(`\`${table.toString()}\``);
    }


    exec(message, args) {
        switch (args.action) {
        case 'records':
            if (!args.player) {
                return message.reply('This command requires a player name');
            }

            this.getRecords(message, args.player);
            break;
        case 'ttm':
            this.getTimeTillMax(message, args.player);
            break;
        case 'update':
            this.update(message, args.player);
            break;
        }
    }
}

module.exports = CmlCommand;
