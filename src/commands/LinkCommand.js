const Command = require('../Command');
const { RichEmbed } = require('discord.js');
const { getHiscores } = require('../Utils');

class LinkCommand extends Command {
    constructor() {
        super('link', {
            aliases: ['link'],
            args: [
                {
                    id: 'name',
                    match: 'rest',
                    default: null
                }
            ],
            description: 'Link an RSN to your account',
            usage: 'link <rsn>'
        });
    }

    async exec(message, args) {
        if (!args.name) {
            return message.util.sendEmbed(this.getUsage(message.util.prefix));
        }

        try  {
            await getHiscores(args.name);
        } catch (e) {
            return message.util.reply(`:no_entry_sign: Sorry... RSN \`${args.name}\` does not exist`)
        }

        this.client.links.set(message.author.id, 'rsn', args.name);
        return message.util.reply(`:white_check_mark: Successfully linked to \`${args.name}\``);
    }
}

module.exports = LinkCommand;
