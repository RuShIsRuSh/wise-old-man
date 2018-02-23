const { Listener } = require('discord-akairo');
const winston = require('winston');

module.exports = class InvalidCommandListener extends Listener {
    constructor() {
        super('invalidCommand', {
            emitter: 'client',
            eventName: 'invalidUsage'
        });
    }

    async exec(message, command) {
        winston.verbose('Displaying help command for', command.id);
        await message.util.sendEmbed(command.getUsage(message.util.prefix));
    }
};
