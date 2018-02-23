const Command = require('../Command');
const Parser = require('rss-parser');
const { RichEmbed } = require('discord.js');
const _ = require('underscore');
const moment = require('moment');

module.exports = class NewsCommand extends Command {
    constructor() {
        super('news', {
            aliases: ['news'],
            description: 'Returns latest Oldschool Runescape news!'
        });

        this.parser = new Parser();
        this.rss_url = 'http://services.runescape.com/m=news/latest_news.rss?oldschool=true';
    }

    async exec(message) {
        const feed = await this.parser.parseURL(this.rss_url);

        const embeds = [];

        _.first(feed.items, 4).forEach(item => {
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
