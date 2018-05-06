const Bloodhound = require('bloodhound-js');
const winston = require('winston');

module.exports = class Cluez {
    constructor() {
        this.cache = false;
        this.ttl = 30000;
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

    getTokenizers(endpoint) {
        let tokenizers = {
            datum: Bloodhound.tokenizers.obj.whitespace('text'),
            query: Bloodhound.tokenizers.whitespace
        };

        switch (endpoint) {
        case 'cipher':
        case 'anagram': {
            tokenizers.datum = function(datum) {
                const [_text, anagram] = datum.text.split(': ');
                let parts = anagram.toLowerCase().split(' ');
                return parts;
            };
            break;
        }
        }

        return tokenizers;
    }

    initialize() {
        if (!process.env.CLUE_API) {
            return winston.warn('Clue API not set. Initialisation cancelled');
        }

        this.engines = {};

        [
            'anagram',
            'emote',
            'cryptic',
            'cipher',
            'fairyRing'
        ].forEach(endpoint => {
            const tokenizers = this.getTokenizers(endpoint);
            console.log(`${process.env.CLUE_API}/clues/${endpoint}`);
            this.engines[endpoint] = new Bloodhound({
                datumTokenizer: tokenizers.datum,
                queryTokenizer: tokenizers.query,
                prefetch: {
                    url: `${process.env.CLUE_API}/clues/${endpoint}`,
                    cache: this.cache,
                    cacheKey: endpoint,
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
