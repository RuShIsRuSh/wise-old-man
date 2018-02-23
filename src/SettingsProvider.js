const { SequelizeProvider } = require('discord-akairo');

module.exports = class SettingsProvider extends SequelizeProvider {
    constructor(table) {
        super(table, {
            idColumn: 'name'
        });
    }

    set(guild, setting, value) {
        return super.set(`${setting}:${guild.id}`, 'data', value);
    }

    get(guild, setting, def) {
        return super.get(`${setting}:${guild.id}`, 'data', def);
    }
};
