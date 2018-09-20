const Command = require('../Command');
const { RichEmbed } = require('discord.js');

class AddInventoryCommand extends Command {
    constructor() {
        super('gear', {
            aliases: ['addinventory', 'addequipment', 'delinventory', 'delequipment'],
            description: 'Create inventory examples',
            args: [
                {
                    id: 'command'
                },
                {
                    id: 'value',
                    default: null
                }
            ],
            userPermissions: ['ADMINISTRATOR'],
        });
    }

    async exec(message, args) {
        if (message.util.alias.startsWith('add')) {
            if (!args.value || !args.command) {
                let type = message.util.alias == 'addequipment' ? 'equipment' : 'inventory';
                return message.reply(`https://osrs.raideer.xyz/generate/${type} \n Click on the link to create an ${type} example, copy the output value and type:\n \`${message.util.prefix}${message.util.alias} ${args.command ||  'COMMAND_NAME'} OUTPUT_VALUE_HERE\``);
            }
        }

        switch (message.util.alias) {
        case 'addinventory': {
            let commandId = `inventory:${args.command}:${message.guild.id}`;
            const exists = this.client.inventories.get(commandId, 'value', null);

            if (exists) {
                return message.reply(`:no_entry: Command \`${message.util.prefix}inventory ${args.command}\` already exists!`);
            }

            if (args.value.split(',').length !== 28) {
                return message.reply(`:no_entry: Invalid command value length!`);
            }

            this.client.inventories.set(commandId, 'value', args.value);

            return message.reply(`:white_check_mark: Created command \`${message.util.prefix}inventory ${args.command}\``);
        }
        case 'addequipment': {
            let commandId = `equipment:${args.command}:${message.guild.id}`;
            const exists = this.client.inventories.get(commandId, 'value', null);

            if (exists) {
                return message.reply(`:no_entry: Command \`${message.util.prefix}equipment ${args.command}\` already exists!`);
            }

            if (args.value.split(',').length !== 11) {
                return message.reply(`:no_entry: Invalid command value length!`);
            }

            this.client.inventories.set(commandId, 'value', args.value);

            return message.reply(`:white_check_mark: Created command \`${message.util.prefix}equipment ${args.command}\``);
        }
        case 'delinventory': {
            let commandId = `inventory:${args.command}:${message.guild.id}`;
            const exists = this.client.inventories.get(commandId, 'value', null);

            if (!exists) {
                return message.reply(`:no_entry: Command \`${message.util.prefix}inventory ${args.command}\` does not exist!`);
            }

            this.client.inventories.clear(commandId);

            return message.reply(`:white_check_mark: Command \`${message.util.prefix}inventory ${args.command}\` deleted!`);
        }
        case 'delequipment': {
            let commandId = `equipment:${args.command}:${message.guild.id}`;
            const exists = this.client.inventories.get(commandId, 'value', null);

            if (!exists) {
                return message.reply(`:no_entry: Command \`${message.util.prefix}equipment ${args.command}\` does not exist!`);
            }

            this.client.inventories.clear(commandId);

            return message.reply(`:white_check_mark: Command \`${message.util.prefix}equipment ${args.command}\` deleted!`);
        }
        }
    }
}

module.exports = AddInventoryCommand;