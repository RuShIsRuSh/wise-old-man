const { Command } = require('discord-akairo');

module.exports = class GnomeCommand extends Command {
    constructor(id, exec, options) {
        if (!options && typeof exec === 'object') {
            options = exec;
            exec = null;
        }

        super(id, exec, options);
    }

    getUsage() {
        return 'Command usage';
    }
};
