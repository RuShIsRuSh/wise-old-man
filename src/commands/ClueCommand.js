const Command = require('../Command');
const { first, isObject, isString } = require('lodash');
const { RichEmbed } = require('discord.js');
const winston = require('winston');

module.exports = class ClueCommand extends Command {
    constructor() {
        super('clue', {
            aliases: ['clue'],
            args: [
                {
                    id: 'query',
                    match: 'rest',
                    default: null
                }
            ],
            description: 'Helps you solve clue scrolls',
            usage: 'clue <query>'
        });
    }

    _getAnagramAnswer(result) {
        let answer = '';

        if (result.answer != '') {
            answer += result.answer;

            if (result.puzzle || result.lightbox) {
                answer += ' or';
            }
        } else if (!result.puzzle && !result.lightbox) {
            answer = 'None';
        }

        if (result.puzzle) {
            answer += ' **Puzzle box**';

            if (result.lightbox) {
                answer += ' or';
            }
        }

        if (result.lightbox) {
            answer += ' **Light box**';
        }

        return answer;
    }

    buildEmbed(result, resultType) {
        const embed = new RichEmbed();

        switch (resultType) {
        case 'anagram':
            embed.setTitle(`ANAGRAM: ${result.text.split(': ')[1]}`);
            embed.setDescription(result.text);
            embed.setColor('#3472F7');
            embed.addField('Solution', result.npc, true);
            embed.addField('Answer', result.answer, true);
            embed.setFooter(`Area: ${result.area}`);
            break;
        case 'emote':
            embed.setTitle(`EMOTE: ${result.firstEmote.name}`);
            embed.setColor('#05AE0E');
            embed.setThumbnail(`${process.env.CLUE_API}/sprites/${result.firstEmote.spriteId}-0.png`)
            embed.addField('Clue', result.text);

            if (result.itemRequirements) {
                embed.addField('Required items', result.itemRequirements.map(item => {
                    if (isObject(item)) {
                        return item.name;
                    }

                    if (isString(item)) {
                        return item;
                    }

                    return '';
                }).join(', '));
            }

            break;
        case 'cryptic':
            embed.setTitle('CRYPTIC CLUE');
            embed.setColor('#2CA8FF');
            embed.addField('Clue', result.text);
            embed.addField('Solution', result.solution);

            if (result.npc) {
                embed.addField('Task', `Speak to ${result.npc}`);
            } else if (result.object) {
                embed.addField('Task', `Search ${result.object.name}`);
            }
            break;
        case 'cipher':
            embed.setTitle(`CYPHER: ${result.text.split(': ')[1]}`);
            embed.setDescription(result.text);
            embed.setColor('#888888');
            embed.addField('Solution', result.npc, true);
            embed.addField('Answer', result.answer, true);
            embed.setFooter(`Area: ${result.area}`);
            break;
        }

        if (result.location) {
            const [x, y] = result.location;
            embed.setImage(`${process.env.CLUE_API}/maplocation/${x}/${y}`);
        }

        return embed;
    }

    async exec(message, args) {
        if (!args.query) {
            return message.util.sendEmbed(this.getUsage(message.util.prefix));
        }

        let results;

        try {
            results = await this.client.cluez.searchAll(args.query);
        } catch (e) {
            winston.error(`Failed searching for ${args.query}`);
            return;
        }

        const resultCount = Object.keys(results).reduce((acc, engine) => {
            return acc + results[engine].length;
        }, 0);

        if (resultCount == 1) {
            const type = Object.keys(results).find(engine => results[engine].length === 1);
            const result = first(results[type]);

            const embed = this.buildEmbed(result, type);
            return message.util.sendEmbed(embed);
        } else if (resultCount > 1) {
            return message.util.reply(`More than 1 result`);
        } else {
            return message.util.reply(`Sorry. Didn't find anything for \`${args.query}\``);
        }
    }
};
