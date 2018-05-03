const Command = require('../Command');
const { first } = require('lodash');

module.exports = class HelpCommand extends Command {
    constructor() {
        super('help', {
            aliases: ['help'],
            description: 'Helps you with commands',
            usage: 'help <command name>',
            args: [
                {
                    id: 'command',
                    type: 'commandAlias',
                    default: null
                }
            ]
        });
    }

    exec(message, args) {
        if (args.command) {
            return message.util.sendEmbed(args.command.getUsage(message.util.prefix));
        } else {
            const command_list = this.client.commandHandler.modules.array().filter(command => command.showInHelp && !command.ownerOnly).map(command => {
                return `\`${first(command.aliases)}\``;
            });

            return message.util.sendEmbed(this.getUsage(message.util.prefix), `List of commands: ${command_list.join(', ')}`);
        }
    }
};
