const { AkairoClient } = require('discord-akairo');
const ItemsProvider = require('./ItemsProvider');
const SettingsProvider = require('./SettingsProvider');
const Cluez = require('./Cluez');
const db = require('../db/models/index');
const Utils = require('./Utils');

module.exports = class GnomeClient extends AkairoClient {
    constructor() {
        super({
            commandDirectory: './src/commands/',
            inhibitorDirectory: './src/inhibitors/',
            listenerDirectory: './src/listeners/',
            handleEdits: false,
            defaultCooldown: 1000,
            commandUtil: true,
            prefix: message => {
                if (message.guild) {
                    const prefix = this.settings.get(message.guild, 'prefix', '!');
                    if (prefix) {
                        return prefix;
                    }
                }

                return '!';
            }
        }, {
            disableEveryone: true
        });

        this.gutils = new Utils(this);
        this.items = new ItemsProvider(db.Item);
        this.settings = new SettingsProvider(db.Setting);
        this.cluez = new Cluez();
    }
};
