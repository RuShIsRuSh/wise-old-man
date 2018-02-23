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
                    match: 'rest',
                    default: ''
                }
            ],
            userPermissions: ['ADMINISTRATOR'],
            channelRestriction: 'guild',
            description: 'Configure various things',
            usage: [
                'config get <setting>',
                'config set prefix <prefix>',
                'config set twitchNotifications <channel>'
            ],
            notes: 'Can only be used by an administrator'
        });
    }

    setSetting(message, setting, value) {
        switch (setting) {
        case 'prefix':
            if (value.length > 2) {
                return message.util.reply(':no_entry: Prefix can\'t be longer than **2 characters**!');
            }

            this.client.settings.set(message.guild, 'prefix', value);
            break;
        case 'twitchNotifications': {
            const channel = this.client.util.resolveChannel(value, message.guild.channels);

            if (channel.type !== 'text') {
                return message.util.reply(`:no_entry: Channel \`${channel.name}\` is not a text channel!`);
            }

            this.client.settings.set(message.guild, 'twitchNotifications', channel.id);

            return message.util.reply(`:white_check_mark: Twitch notifications are now enabled for channel <#${channel.id}>`);
        }
        default:
            return message.util.reply(`:no_entry: Setting \`${setting}\` is not recognised`);
        }

        message.util.reply(`:white_check_mark: \`${setting}\` has been set to \`${value}\``);
    }

    exec(message, args) {
        switch (args.op) {
        case 'get': {
            const value = this.client.settings.get(message.guild, args.setting, null);
            if (value === null) {
                return message.util.reply(`:no_entry: Setting \`${args.setting}\` does not exist in this guild`);
            }

            message.util.reply(`:white_check_mark: **${args.setting}** is set to \`${value}\``);
            break;
        }
        case 'set': {
            this.setSetting(message, args.setting, args.value);
            break;
        }
        default: {
            message.util.reply(':no_entry: Invalid operation!');
            break;
        }
        }
    }
}

module.exports = SettingsCommand;
