const Command = require('../Command');

class SettingsCommand extends Command {
    constructor() {
        super('settings', {
            aliases: ['config'],
            args: [
                {
                    id: 'op',
                    types: ['get', 'set']
                },
                {
                    id: 'setting'
                },
                {
                    id: 'value',
                    match: 'rest'
                }
            ]
        });
    }

    setSetting(message, setting, value) {
        switch (setting) {
        case 'prefix':
            this.client.settings.set(`prefix:${message.guild.id}`, 'data', value);
            break;
        }

        message.util.reply(`\`${setting}\` has been set to \`${value}\``);
    }

    exec(message, args) {
        switch (args.op) {
        case 'get':
            break;
        case 'set':
            this.setSetting(message, args.setting, args.value);
            break;
        }
    }
}

module.exports = SettingsCommand;
