const Command = require('../Command');
const { RichEmbed } = require('discord.js');

class AboutCommand extends Command {
    constructor() {
        super('about', {
            aliases: ['about', 'version', 'v'],
            description: 'Information about **The Wise Old Man**'
        });
    }

    exec(message) {
        const vt = `v${require('../../package.json').version}`;

        if (message.util.alias == 'v') {
            return message.channel.send(vt);
        }

        const embed = new RichEmbed();
        embed.setTitle('Wise Old Man');
        embed.setThumbnail('https://i.imgur.com/FIkB6oT.png');
        embed.setDescription(
            'placeholder'
        );

        embed.setFooter(`💚 ${vt}`);
        embed.setColor(3186940);

        return message.channel.send({ embed });
    }
}

module.exports = AboutCommand;
