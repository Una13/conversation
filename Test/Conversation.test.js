const fs     = require('fs');

const Conversation       = require('../Conversation');
const ConversationConfig = require('../config');

const conversationFile   = fs.readFileSync('Test/troubleshooting.json');
const conversationSchema = JSON.parse(conversationFile.toString());

describe('File: Conversation.js', () => {
    describe('Function: constructor()', () => {
        it('Throws error, file does not exist', () => {
            expect(() => new Conversation(''))
                .toThrow(new Error("[Conversation] Not provided '' JSON file"));
        });
        it('Throws error, not valid constructor parameter', () => {
            expect(() => new Conversation(8))
                .toThrow(new Error('[Conversation] Input data must be in JSON format'));
        });
        it('Throws error, empty JSON object', () => {
            expect(() => new Conversation([]))
                .toThrow(new Error('[Conversation] Empty JSON data'));
        });
        it('Throws error, missing id parameter', () => {
            const data = [{
                question: 'What kind of problem are you facing?',
            }];
            expect(() => new Conversation(data))
                .toThrow(new Error('[Conversation] Missing required property \'id\' (string)'));
        });
        it('Throws error, id is empty string', () => {
            const data = [{
                id: '',
                question: 'What kind of problem are you facing?',
            }];
            expect(() => new Conversation(data))
                .toThrow(new Error('[Conversation] Missing required property \'id\' (string)'));
        });
        it('Throws error, id is not a string', () => {
            const data = [{
                id: {},
                question: 'What kind of problem are you facing?',
            }];
            expect(() => new Conversation(data))
                .toThrow(new Error('[Conversation] Missing required property \'id\' (string)'));
        });
        it('Throws error, question is not provided', () => {
            const data = [{
                id: 'start'
            }];
            expect(() => new Conversation(data))
                .toThrow(new Error('[Conversation] Missing required property \'question\' (string)'));
        });
        it('Throws error, question is not a string', () => {
            const data = [{
                id: 'start',
                question: {},
            }];
            expect(() => new Conversation(data))
                .toThrow(new Error('[Conversation] Missing required property \'question\' (string)'));
        });
        it('Throws error, answerOptions must have answer and nextState properties', () => {
            const data = [{
                id: 'start',
                question: 'What kind of problem are you facing?',
                answerOptions: [{}]
            }];
            expect(() => new Conversation(data))
                .toThrow(new Error('[Conversation] \'answerOption\' must have properties '
                    + '\'answer\' (string) and \'nextState\' (string)'));
        });
        it('Throws error, answer missing in answerOptions', () => {
            const data = [{
                id: 'start',
                question: 'What kind of problem are you facing?',
                answerOptions: [{
                    nextState: 'phoneModel'
                }]
            }];
            expect(() => new Conversation(data))
                .toThrow(new Error('[Conversation] \'answerOption\' must have properties '
                    + '\'answer\' (string) and \'nextState\' (string)'));
        });
        it('Throws error, nextState missing in answerOptions', () => {
            const data = [{
                id: 'start',
                question: 'What kind of problem are you facing?',
                answerOptions: [{
                    answer: 'My phone doesn\'t work'
                }]
            }];
            expect(() => new Conversation(data))
                .toThrow(new Error('[Conversation] \'answerOption\' must have properties '
                    + '\'answer\' (string) and \'nextState\' (string)'));
        });
    });

    describe('Function: reply()', () => {
        it('Current state is empty, start from the beginning of the conversation', () => {
            const conversation = new Conversation('Test/troubleshooting.json');
            expect(conversation.reply('Help')).toStrictEqual(conversationSchema[0]);
        });
        it('Continue the conversation until the end state is reached', () => {
            const conversation = new Conversation('Test/troubleshooting.json');
            expect(conversation.reply('')).toStrictEqual(conversationSchema[0]);
            expect(conversation.reply('My phone doesn\'t work'))
                .toStrictEqual(conversationSchema.find((data) => data.id === 'phoneModel'));
            expect(conversation.reply('iPhone X'))
                .toStrictEqual(conversationSchema.find((data) => data.id === 'appleServiceEnd'));
        });
        it('Answer is not supported, returns generated answer and start conversation from the beginning', () => {
            const conversation = new Conversation('Test/troubleshooting.json');
            expect(conversation.reply('')).toStrictEqual(conversationSchema[0]);
            expect(conversation.reply('No'))
                .toStrictEqual({
                    id: 'unsupportedAnswerEnd',
                    question: ConversationConfig.unsupportedAnswer
                });
            expect(conversation.reply('iPhone X')).toStrictEqual(conversationSchema[0]);
        });
        it('Return appropriate answer, user answer is not case sensitive', () => {
            const conversation = new Conversation('Test/troubleshooting.json');
            expect(conversation.reply('')).toStrictEqual(conversationSchema[0]);
            expect(conversation.reply('my Internet doesn\'t work'))
                .toStrictEqual(conversationSchema.find((data) => data.id === 'routerReset'));
        });
        it('No nextState, start from the beginning of the conversation', () => {
            const conversation = new Conversation([conversationSchema[0]]);
            expect(conversation.reply('')).toStrictEqual(conversationSchema[0]);
            expect(conversation.reply('My internet doesn\'t work')).toStrictEqual(conversationSchema[0]);
        });
    });
});
