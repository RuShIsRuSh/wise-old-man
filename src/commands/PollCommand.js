const Command = require('../Command');
const { RichEmbed } = require('discord.js');
const request = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');
const { first, truncate } = require('lodash');

class PollCommand extends Command {
    constructor() {
        super('poll', {
            aliases: ['poll', 'lastPoll'],
            args: [
                {
                    id: 'id',
                    type: 'integer',
                    default: 1
                }
            ],
            description: 'Returns the lastest poll results'
        });

    }

    async getPollList() {
        const html = await request('http://services.runescape.com/m=poll/oldschool/archive.ws');
        const $ = cheerio.load(html);
        const items = [];
        $('a').filter((index, item) => {
            const link = $(item).attr('href');
            return link && link.split('.')[0] == 'results';
        }).each((index, item) => {
            const el = $(item);
            const createdDate = el.parent().siblings().first().text().replace(/\r?\n|\r/g, '');
            
            items.push({
                link: el.attr('href'),
                id: el.attr('href').split('=')[1],
                title: el.text(),
                date: createdDate
            });
        });

        return items;
    }

    async getPollData(poll) {
        const data = Object.assign({}, poll);

        const html = await request(`http://services.runescape.com/m=poll/oldschool/results.ws?id=${poll.id}`);
        const $ = cheerio.load(html);

        const numVotesEl = $('b:contains("Total Number of Votes")').first();
        data.votes = parseInt(numVotesEl.text().replace( /^\D+/g, ''));
        data.questions = [];

        $('.question').each((index, item) => {
            const el = $(item);
            const question = {
                text: el.find('b').first().text(),
                answers: []
            };

            el.find('tbody tr').each(function() {
                const cols = $(this).find('td');
                const votesText = cols.last().text();
                const [_text, perc, votes] = votesText.match(/([0-9.]+)% \(([0-9]+) votes\)/i);
                const answer = {
                    option: cols.first().text(),
                    percentage: parseFloat(perc),
                    votes: parseInt(votes)
                };

                question.answers.push(answer);
            });

            data.questions.push(question);
        });

        return data;
    }

    async exec(message, args) {
        const polls = await this.getPollList();
        if (args.id < 1 || args.id >= polls.length) {
            return message.util.reply('Invalid poll selector');
        }
        
        const poll = await this.getPollData(polls[args.id - 1]);

        const embed = new RichEmbed();
        embed.setTitle(poll.title);
        embed.setTimestamp(new Date(poll.date));
        embed.setURL(`http://services.runescape.com/m=poll/oldschool/results.ws?id=${poll.id}`);
        embed.setFooter(poll.title);
        poll.questions.forEach(question => {
            embed.addField(
                `**${truncate(first(question.text.split('?')), {length: 250})}?**`,
                question.answers.map(answer => {
                    let emoji = ':white_small_square:';
                    if (answer.option == 'Yes') {
                        if (answer.percentage >= 75) {
                            emoji = ':white_check_mark:';
                        } else {
                            emoji = ':x:';
                        }
                    } 
                    return `${emoji} **${answer.option}**: ${answer.votes} votes (${answer.percentage}%)`
                }).join('\n')
            )
        });

        message.util.sendEmbed(embed);
    }
}

module.exports = PollCommand;
