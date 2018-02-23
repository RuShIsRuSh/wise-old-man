const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');
const _ = require('underscore');

module.exports = class GnomeCommand extends Command {
    constructor(id, exec, options) {
        if (!options && typeof exec === 'object') {
            options = exec;
            exec = null;
        }

        super(id, exec, options);

        this.description = options.description || '';
        this.usage = options.usage || '';
        this.notes = options.notes || '';

        this.showInHelp = typeof options.showInHelp === 'undefined' ? true : !!options.showInHelp;
    }

    getUsage(prefix = '!') {
        const embed = new RichEmbed();
        const aliases = _.drop(this.aliases).length > 0 ? `(${_.drop(this.aliases).join(' | ')})` : '';

        embed.setTitle(`Command: ${_.first(this.aliases)} ${aliases}`);
        embed.setDescription(this.description);

        if (this.usage) {
            if (Array.isArray(this.usage)) {
                embed.addField('Usage', this.usage.map(usage => `\`${prefix}${usage}\``).join('\n'));
            } else {
                embed.addField('Usage', `\`${prefix}${this.usage}\``);
            }
        }

        if (this.notes) {
            embed.setFooter(this.notes);
        }

        return embed;
    }
};
