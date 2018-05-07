const { Op } = require('sequelize');
const { SequelizeProvider } = require('discord-akairo');
const Bloodhound = require('bloodhound-js');
const request = require('request-promise');
const winston = require('winston');
const { first, compact, isArray, flattenDeep } = require('lodash');
const { acronyms, replacements } = require('./item_acronyms');

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
                name: item.name,
                acronym: false
            };
        });

        for (const id in acronyms) {
            acronyms[id].forEach(acronym => {
                dict.push({
                    id,
                    name: acronym,
                    acronym: true
                });
            });
        }

        // Query - Item being searched
        const queryTokenizer = query => {
            let parts = String(query).toLowerCase().split(/[^a-z0-9\+]/gi);

            parts = parts.map(part => {
                if (part in replacements) {
                    return queryTokenizer(replacements[part]);
                }
                
                return part;
            });

            parts = flattenDeep(parts);
            parts = compact(parts);
            
            console.log(parts);
            return parts;
        };

        // Datums - Items being searched through
        const datumTokenizer = datum => {
            let parts = String(datum.name).toLowerCase();
            parts = parts.split(/[^a-z0-9\+]/gi);
            parts = compact(parts);
            return parts;
        };

        this.engine = new Bloodhound({
            local: dict,
            queryTokenizer: queryTokenizer,
            datumTokenizer: datumTokenizer
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
                    id: first(ids)
                }
            });
        }

        return item;
    }
};
