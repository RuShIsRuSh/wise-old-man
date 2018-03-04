const { Op } = require('sequelize');
const { SequelizeProvider } = require('discord-akairo');
const Bloodhound = require('bloodhound-js');
const request = require('request-promise');
const winston = require('winston');
const _ = require('underscore');

module.exports = class ItemsProvider extends SequelizeProvider {
    constructor(table, options) {
        super(table, options);

        this.engine = null;
    }

    async getSearchEngine(forceNew = false) {
        if (this.engine && !forceNew) {
            return this.engine;
        }

        const dict = this.items.map(item => {
            return {
                id: item.id,
                query: item.query
            };
        });

        this.engine = new Bloodhound({
            local: dict,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('query')
        });

        await this.engine.initialize();

        return this.engine;
    }

    async getOsbuddyDetails(id) {
        try {
            const data = await request({
                uri: `https://api.rsbuddy.com/grandExchange?a=guidePrice&i=${id}`,
                json: true
            });

            return data;
        } catch (e) {
            winston.error(`Failed to retrieve osbuddy item ${id} details`);
        }
    }

    async getItemDetails(id) {
        try {
            const data = await request({
                uri: `https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=${id}`,
                json: true
            });

            return data.item;
        } catch (e) {
            winston.error(`Failed to retrieve item ${id} details`);
        }
    }

    async getItemChart(id) {
        try {
            const data = await request({
                uri: `https://services.runescape.com/m=itemdb_oldschool/api/graph/${id}.json`,
                json: true
            });

            return data;
        } catch (e) {
            winston.error(`Failed to retrieve item ${id} details`);
        }
    }

    async findInDicitonary(name) {
        const engine = await this.getSearchEngine();
        return new Promise(resolve => {
            engine.search(name, resolve);
        });
    }

    async findItem(name, all = false) {
        let item = null;

        const results = await this.findInDicitonary(name);
        const ids = results.reduce((acc, result) => {
            acc.push(result.id);
            return acc;
        }, []);

        if (all) {
            item = await this.table.findAndCountAll({
                where: {
                    id: {
                        [Op.in]: ids
                    }
                },
                limit: 10
            });
        } else {
            item = await this.table.find({
                where: {
                    id: _.first(ids)
                }
            });
        }

        return item;
    }
};
