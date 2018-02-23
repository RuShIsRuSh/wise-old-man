const Bloodhound = require('bloodhound-js');

module.exports = class Cluez {
    constructor() {
        const cache = false;
        const ttl = 300000;
        const anagrams = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('anagram'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/anagram`,
                cache: cache,
                cacheKey: 'anagrams',
                ttl: ttl
            }
        });

        const emotes = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('clue'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/emote`,
                cache: cache,
                cacheKey: 'emotes',
                ttl: ttl
            }
        });

        const lyrics = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('lyric'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/lyric`,
                cache: cache,
                cacheKey: 'lyrics',
                ttl: ttl
            }
        });

        const cryptic = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('clue'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/cryptic`,
                cache: cache,
                cacheKey: 'cryptics',
                ttl: ttl
            }
        });

        const coords = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('deg'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/coord`,
                cache: cache,
                cacheKey: 'coords',
                ttl: ttl
            }
        });

        const ciphers = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('cipher'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/cipher`,
                cache: cache,
                cacheKey: 'ciphers',
                ttl: ttl
            }
        });

        const sherlock = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('task'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/sherlock`,
                cache: cache,
                cacheKey: 'sherlock',
                ttl: ttl
            }
        });

        this.engines = {
            anagrams, emotes, lyrics, cryptic, coords, ciphers, sherlock
        };
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
        const promises = [];
        for (const i in this.engines) {
            promises.push(this.engines[i].initialize());
        }

        return Promise.all(promises);
    }
};
