const Command = require('../Command');
const { RichEmbed } = require('discord.js');
const Wikia = require('node-wikia');

class WikiCommand extends Command {
    constructor() {
        super('wiki', {
            aliases: ['wiki', 'info'],
            args: [
                {
                    id: 'query',
                    match: 'rest',
                    default: null
                }
            ],
            description: 'Returns related articles from Oldschool Runescape WIKI',
            usage: 'wiki <query>'
        });

        this.wiki = new Wikia('oldschoolrunescape');
    }

    async exec(message, args) {
        if (!args.query) {
            return message.util.sendEmbed(this.getUsage(message.util.prefix));
        }

        let results;
        try {
            results = await this.wiki.getSearchList({
                query: args.query,
                limit: 5
            });
        } catch (e) {
            return message.util.reply(`No results found for \`${args.query}\``);
        }

        const embed = new RichEmbed();
        embed.setTitle(`:mag_right: OSRS Wiki results for "${args.query}"`);
        embed.setFooter(`Total results: ${results.total}`);
        embed.setThumbnail('https://i.imgur.com/dvYciWt.png');

        results.items.forEach(item => {
            embed.addField(item.title, item.url);
        });

        message.util.sendEmbed(embed);
    }
}

module.exports = WikiCommand;
