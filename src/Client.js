const { AkairoClient } = require('discord-akairo');
const ItemsProvider = require('./ItemsProvider');
const SettingsProvider = require('./SettingsProvider');
const Cluez = require('./Cluez');
const db = require('../db/models/index');
const CronHandler = require('./CronHandler');
const winston = require('winston');

module.exports = class GnomeClient extends AkairoClient {
    constructor() {
        super({
            commandDirectory: './src/commands/',
            inhibitorDirectory: './src/inhibitors/',
            listenerDirectory: './src/listeners/',
            cronDirectory: './src/cronjobs/',
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
        });

        this.items = new ItemsProvider(db.Item);
        this.settings = new SettingsProvider(db.Setting);
        this.cluez = new Cluez();
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

    env(key, defaultValue = null) {
        if (process.env[key]) {
            if (process.env[key] == 'true') {
                return true;
            } else if (process.env[key] == 'false') {
                return false;
            }

            return process.env[key];
        }

        if (typeof defaultValue === 'function') {
            return defaultValue.call(this);
        }

        return defaultValue;
    }
};
