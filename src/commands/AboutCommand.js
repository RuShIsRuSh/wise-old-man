const Command = require('../Command');
const { RichEmbed } = require('discord.js');

class AboutCommand extends Command {
    constructor() {
        super('about', {
            aliases: ['about', 'version', 'v']
        });
    }

    exec(message) {
        const vt = `v${require('../../package.json').version}`;

        if (message.util.alias == 'v') {
            return message.channel.send(vt);
        }

        const embed = new RichEmbed();
        embed.setTitle('Golden Gnome');
        embed.setThumbnail('https://i.imgur.com/xyUgc9a.jpg');
        embed.setDescription(
            'placeholder'
        );

        embed.setFooter(`💚 ${vt}`);
        embed.setColor(3186940);

        return message.channel.send({ embed });
    }
}

module.exports = AboutCommand;
