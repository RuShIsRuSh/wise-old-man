const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');
const _ = require('lodash');
const CronHandler = require('./CronHandler');
const winston = require('winston');

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

    build() {
        if (this.akairoOptions.cronDirectory) {
            winston.info('Constructing cron handler');
            this.cronHandler = new CronHandler(this, this.akairoOptions);
        } else {
            winston.warn('Cron module is not set up');
        }

        super.build();

        return this;
    }

    loadAll() {
        super.loadAll();
        if (this.cronHandler) this.cronHandler.loadAll();
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
