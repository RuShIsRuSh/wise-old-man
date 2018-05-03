const Command = require('../Command');
const AsciiTable = require('ascii-table');
const moment = require('moment');
const { RichEmbed } = require('discord.js');
const { first } = require('lodash');

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

    getEmbed(details, osbuddy, handle) {
        const embed = new RichEmbed();

        embed
        .setColor(0x753816)
        .setTitle(`${details.name} *(ID: ${details.id})*`);

        if (handle !== 'price') {
            embed
            .setDescription(details.description)
            .setThumbnail(details.icon_large)
            .addField('Current GE price', details.current.price)
            .addField('Current OSBUDDY buy price', `${Number(osbuddy.buying).toLocaleString()} gp (Quantity: ${osbuddy.buyingQuantity})`, true)
            .addField('Current OSBUDDY sell price', `${Number(osbuddy.selling).toLocaleString()} gp (Quantity: ${osbuddy.sellingQuantity})`, true)
            .addField('This month\'s trend:', `${details.day30.trend} (${details.day30.change})`)
            .addField('Members item', details.members == 'true' ? 'Yes' : 'No')
            .setURL(`http://services.runescape.com/m=itemdb_oldschool/viewitem?obj=${details.id}`)
            ;
        } else {
            embed
            .setThumbnail(details.icon)
            .addField('Current GE price', details.current.price)
            .addField('Current OSBUDDY buy price', `${Number(osbuddy.buying).toLocaleString()} gp (Quantity: ${osbuddy.buyingQuantity})`)
            .addField('Current OSBUDDY sell price', `${Number(osbuddy.selling).toLocaleString()} gp (Quantity: ${osbuddy.sellingQuantity})`)
            .setURL(`http://services.runescape.com/m=itemdb_oldschool/viewitem?obj=${details.id}`)
            ;
        }

        if (process.env.CLUE_API) {
            const date = moment().format('DDMMYYYY');
            embed.setImage(`${process.env.CLUE_API}/items/graph/${details.id}/?x=${date}`);
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

            const item = first(results.rows);

            this.showItem(item.id, handle).then(embed => {
                message.util.sendEmbed(embed);
            });
        });
    }

    async showItem(itemId, handle) {
        const item = await this.client.items.getItemDetails(itemId);
        const osbuddy = await this.client.items.getOsbuddyDetails(itemId);
        return this.getEmbed(item, osbuddy, handle);
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
