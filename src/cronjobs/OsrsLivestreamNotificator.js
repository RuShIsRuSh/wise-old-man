const CronModule = require('../CronModule');
const request = require('request-promise');
const { RichEmbed } = require('discord.js');
const winston = require('winston');
const _ = require('lodash');
const Promise = require('bluebird');

module.exports = class OsrsLivestreamNotificator extends CronModule {
    constructor() {
        super('livestreamNotificator', {
            tab: '*/10 * * * *'
        });

        this.channel = 'oldschoolrs';
    }

    async _processGuild(guild, data) {
        const channel = this.client.settings.get(guild, 'twitchNotifications', false);

        if (channel) {
            const guildChannel = guild.channels.get(channel);
            if (!guildChannel) return;

            const lastNotified = this.client.settings.get(guild, 'twitchLastNotified', null);

            if (data.stream.created_at == lastNotified) {
                return;
            } else {
                this.client.settings.set(guild, 'twitchLastNotified', data.stream.created_at);
            }

            const embed = new RichEmbed();
            embed.setAuthor(data.stream.channel.display_name, data.stream.channel.logo);
            embed.setThumbnail(data.stream.channel.logo);
            embed.setTitle(data.stream.channel.status);
            embed.setURL(data.stream.channel.url);
            embed.addField('Viewers', data.stream.viewers);
            embed.setImage(data.stream.preview.medium);
            embed.setFooter('Twitch.tv', 'https://i.imgur.com/g73ugRg.png');
            embed.setColor('#6441A4');

            await guildChannel.send(`Hey @everyone! Oldschool Runescape is now live on twitch @ https://www.twitch.tv/${this.channel}`, {
                embed: embed
            });
        }
    }

    async exec() {
        if (!process.env.TWITCH_CLIENT_ID) {
            return winston.warn('TWITCH_CLIENT_ID not set');
        }

        const data = await request({
            uri: `https://api.twitch.tv/kraken/streams/${this.channel}`,
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID
            },
            json: true
        });

        if (data.stream) {
            if (data.stream.is_playlist) {
                return;
            }

            await Promise.each(this.client.guilds.array(), async guild => {
                await this._processGuild(guild, data);
            });
        }
    }
};
