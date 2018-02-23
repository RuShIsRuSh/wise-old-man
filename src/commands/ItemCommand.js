const Command = require('../Command');
const AsciiTable = require('ascii-table');
const { RichEmbed } = require('discord.js');
const _ = require('underscore');

module.exports = class ItemCommand extends Command {
    constructor() {
        super('item', {
            aliases: ['item', 'price', 'ge'],
            args: [
                {
                    id: 'item',
                    match: 'rest',
                    type: 'dynamic'
                }
            ],
            description: 'Returns GE information about a specific item',
            usage: 'item <item name OR item id>'
        });
    }

    getEmbed(details, handle) {
        const embed = new RichEmbed();

        if (handle !== 'price') {
            embed
            .setColor(0x753816)
            .setTitle(`${details.name} *(ID: ${details.id})*`)
            .setDescription(details.description)
            .setThumbnail(details.icon_large)
            .addField('Current GE price', details.current.price)
            .addField('This month\'s trend:', `${details.day30.trend} (${details.day30.change})`)
            .addField('Members item', details.members == 'true' ? 'Yes' : 'No')
            .setURL(`http://services.runescape.com/m=itemdb_oldschool/viewitem?obj=${details.id}`)
            ;
        } else {
            embed
            .setColor(0x753816)
            .setTitle(`${details.name} *(ID: ${details.id})*`)
            .setThumbnail(details.icon)
            .addField('Current GE price', details.current.price)
            .setURL(`http://services.runescape.com/m=itemdb_oldschool/viewitem?obj=${details.id}`)
            ;
        }

        return embed;
    }

    showItems(items) {
        const embed = new RichEmbed();
        const table = new AsciiTable();

        for (const i of items.rows) {
            table.addRow(i.id, i.name);
        }

        if (items.count - 10 > 0) {
            table.addRow(null, `And ${items.count - 10} more...`);
        }

        embed
        .setTitle(`Found more than 1 item (${items.count})`)
        .setDescription(`\`${table.toString()}\``)
        .setFooter('Use command "item <id>" to select');

        return embed;
    }

    findAndShowItem(itemName, message, handle) {
        return this.client.items.findItem(itemName, true).then(results => {
            if (results.count === 0) {
                return message.util.reply(`Item "${itemName}" not found.`);
            }

            if (results.count > 1) {
                return message.util.sendEmbed(this.showItems(results));
            }

            const item = _.first(results.rows);

            this.showItem(item.id, handle).then(embed => {
                message.util.sendEmbed(embed);
            });
        });
    }

    async showItem(itemId, handle) {
        const item = await this.client.items.getItemDetails(itemId);
        return this.getEmbed(item, handle);
    }

    async exec(message, args) {
        if (!isNaN(args.item)) {
            try {
                const embed = await this.showItem(args.item, message.util.alias);
                message.util.sendEmbed(embed);
            } catch (e) {
                this.findAndShowItem(args.item, message, message.util.alias);
            }
        } else {
            this.findAndShowItem(args.item, message, message.util.alias);
        }
    }
};
