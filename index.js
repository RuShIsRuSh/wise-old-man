global.Promise = require('bluebird');
require('dotenv').config();
require('colors');

const winston = require('winston');
const Client = require('./src/Client');

const client = new Client();

Promise.all([
    client.items.init()
]).then(async () => {
    winston.info('Attempting to log in');
    await client.login(process.env.BOT_TOKEN);
    winston.info('Successfully logged in!'.green);

    client.user.setActivity('OSRS');
});
