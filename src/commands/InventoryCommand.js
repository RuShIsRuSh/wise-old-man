const Command = require('../Command');
const { RichEmbed } = require('discord.js');

class InventoryCommand extends Command {
    constructor() {
        super('inventory', {
            aliases: ['inventory', 'equipment'],
            description: 'View and create inventory examples',
            args: [
                {
                    id: 'command'
                },
                {
                    id: 'value',
                    match: 'rest'
                }
            ]
        });
    }

    async exec(message, args) {
        const commandId = `${message.util.alias}:${args.command}:${message.guild.id}`;

        switch (message.util.alias) {
        case 'inventory': {
            const value = this.client.inventories.get(commandId, 'value', null);

            if (!value) {
                return message.reply(`:cry: Sorry! Couldn't find anything.`);
            }

            const embed = new RichEmbed();
            embed.setTitle(args.command);
            embed.setImage(`https://osrs.raideer.xyz/api/inventory/${value}`);

            return message.util.sendEmbed(embed);
        }
        case 'equipment': {
            const value = this.client.inventories.get(commandId, 'value', null);

            if (!value) {
                return message.reply(`:cry: Sorry! Couldn't find anything.`);
            }

            const embed = new RichEmbed();
            embed.setTitle(args.command);
            embed.setImage(`https://osrs.raideer.xyz/api/equipment/${value}`);

            return message.util.sendEmbed(embed);
        }
        }
    }
}

module.exports = InventoryCommand;
