const { SequelizeProvider } = require('discord-akairo');

module.exports = class SettingsProvider extends SequelizeProvider {
    constructor(table) {
        super(table, {
            idColumn: 'name'
        });
    }
};
