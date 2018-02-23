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

        const anagrams = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('anagram'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/anagram`,
                cache: this.cache,
                cacheKey: 'anagrams',
                ttl: this.ttl
            }
        });

        const emotes = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('clue'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/emote`,
                cache: this.cache,
                cacheKey: 'emotes',
                ttl: this.ttl
            }
        });

        const lyrics = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('lyric'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/lyric`,
                cache: this.cache,
                cacheKey: 'lyrics',
                ttl: this.ttl
            }
        });

        const cryptic = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('clue'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/cryptic`,
                cache: this.cache,
                cacheKey: 'cryptics',
                ttl: this.ttl
            }
        });

        const coords = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('deg'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/coord`,
                cache: this.cache,
                cacheKey: 'coords',
                ttl: this.ttl
            }
        });

        const ciphers = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('cipher'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/cipher`,
                cache: this.cache,
                cacheKey: 'ciphers',
                ttl: this.ttl
            }
        });

        const sherlock = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('task'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: `${process.env.CLUE_API}/api/clues/sherlock`,
                cache: this.cache,
                cacheKey: 'sherlock',
                ttl: this.ttl
            }
        });

        this.engines = {
            anagrams, emotes, lyrics, cryptic, coords, ciphers, sherlock
        };

        const promises = [];
        for (const i in this.engines) {
            promises.push(this.engines[i].initialize());
        }

        return Promise.all(promises);
    }
};
