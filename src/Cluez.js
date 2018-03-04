const Bloodhound = require('bloodhound-js');
const winston = require('winston');

module.exports = class Cluez {
    constructor() {
        this.cache = false;
        this.ttl = 300000;
        this.engines = {};
    }

    search(engine, query) {
        return new Promise(resolve => {
            this.engines[engine].search(query, resolve);
        });
    }

    async searchAll(query) {
        const results = {};

        const engineOrder = [];
        const promises = [];
        for (const engine in this.engines) {
            engineOrder.push(engine);
            promises.push(this.search(engine, query));
        }

        await Promise.all(promises)
        .then(searchResults => {
            searchResults.forEach(res => {
                const engine = engineOrder.shift();
                results[engine] = res;
            });
        });

        return results;
    }

    initialize() {
        if (!process.env.CLUE_API) {
            return winston.warn('Clue API not set. Initialisation cancelled');
        }

        this.engines = {};

        [
            ['anagram', 'anagram'],
            ['emote', 'clue'],
            ['lyric', 'lyric'],
            ['cryptic', 'clue'],
            ['coord', 'deg'],
            ['cipher', 'cipher'],
            ['sherlock', 'task']
        ].forEach(endpoint => {
            const key = endpoint[0];
            const token = endpoint[1];
            this.engines[key] = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace(token),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                prefetch: {
                    url: `${process.env.CLUE_API}/${key}`,
                    cache: this.cache,
                    cacheKey: key,
                    ttl: this.ttl
                }
            });
        });

        const promises = [];
        for (const i in this.engines) {
            promises.push(this.engines[i].initialize());
        }

        return Promise.all(promises).catch(() => {
            winston.error('Failed to initialize cluez module');
        });
    }
};
