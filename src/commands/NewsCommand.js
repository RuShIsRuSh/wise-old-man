const Command = require('../Command');
const Parser = require('rss-parser');
const { RichEmbed } = require('discord.js');
const { first } = require('lodash');
const moment = require('moment');

module.exports = class NewsCommand extends Command {
    constructor() {
        super('news', {
            aliases: ['news'],
            args: [
                {
                    id: 'num',
                    type: 'integer',
                    default: 4
                }
            ],
            description: 'Returns latest Oldschool Runescape news!',
            usage: [
                'news [number of articles]'
            ],
            notes: 'Returns max of 4 articles'
        });

        this.parser = new Parser();
        this.rss_url = 'http://services.runescape.com/m=news/latest_news.rss?oldschool=true';
    }

    async exec(message, args) {
        const feed = await this.parser.parseURL(this.rss_url);

        const embeds = [];

        const num = args.num > 4 ? 4 : args.num;

        first(feed.items, num).forEach(item => {
            const embed = new RichEmbed();
            embed.setTitle(item.title);
            embed.setURL(item.link);

            const date = moment(item.pubDate);
            embed.setFooter(`${date.fromNow()} | ${date.format('dddd, MMMM Do YYYY')}`);
            embed.setDescription(item.content);

            if (['image/jpeg', 'image/png'].indexOf(item.enclosure.type) !== -1) {
                embed.setThumbnail(item.enclosure.url);
            }

            embeds.push(embed);
        });

        embeds.forEach(embed => {
            message.util.sendEmbed(embed);
        });
    }
};
