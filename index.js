require('dotenv').config();
require('colors');

const winston = require('winston');
winston.cli();

const Client = require('./src/Client');

const client = new Client();

client.on('error', e => {
    winston.error('Client websocket error', e);
});

winston.info('Starting preloading'.cyan);
Promise.all([
    client.settings.init(),
    client.items.init(),
    client.cluez.initialize()
]).then(async () => {
    winston.info('Preloading done'.cyan);
    winston.info('Attempting to log in');
    await client.login(process.env.BOT_TOKEN);
    winston.info('Successfully logged in!'.green);

    client.user.setActivity('OSRS');
});
