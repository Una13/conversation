const fs     = require('fs');

/**
 * Config file contains question in the case that answer is not provided
 * @returns {{unsupportedAnswer: string}}
 */
const config  = require('./config');

/**
 * Validates format of conversation structure.
 * File data must contain array of the conversation states with provided question, state id and possible answers which
 * lead to the next state.
 * @param data {{question: string, id: string, answerOptions: [{answer: string, nextState: string},
 * {answer: string, nextState: string}]}[]}
 */
function validateConversationDataFormat(data) {
    if (typeof data !== 'object') {
        throw Error('[Conversation] Input data must be in JSON format');
    }

    if (data.length < 1) {
        throw Error('[Conversation] Empty JSON data');
    }

    for (const element of data) {
        if (!Object.prototype.hasOwnProperty.call(element, 'id')
            || typeof element.id !== 'string' || element.id === '') {
            throw Error('[Conversation] Missing required property \'id\' (string)');
        }

        if (!Object.prototype.hasOwnProperty.call(element, 'question')
            || typeof element.question !== 'string') {
            throw Error('[Conversation] Missing required property \'question\' (string)');
        }

        if (Object.prototype.hasOwnProperty.call(element, 'answerOptions') && element.answerOptions.length > 0) {
            const invalidAnswerOptions = element.answerOptions.find(
                (answerOption) => !Object.prototype.hasOwnProperty.call(answerOption, 'answer')
                    || typeof answerOption.answer !== 'string'
                    || !Object.prototype.hasOwnProperty.call(answerOption, 'nextState')
                    || typeof answerOption.nextState !== 'string'
            );

            if (invalidAnswerOptions) {
                throw Error('[Conversation] \'answerOption\' must have properties \'answer\' (string) '
                    + 'and \'nextState\' (string)');
            }
        }
    }
}

/**
 * Conversation class which read conversation structure from JSON object or file and provides questions
 * and possible answers.
 * Depending on chosen answers different states will be reached in order to lead the user to the final state.
 */
class Conversation {
    /**
     * Creates the new instance of Conversation class
     * @param data {string | {question: string, id: string, answerOptions: [{answer: string, nextState: string},
     * {answer: string, nextState: string}]}[]} Path to JSON predefined conversation data, can be JSON or file data
     */
    constructor(data) {
        let conversationData = data;

        // Input contains path to the JSON file
        if (typeof data === 'string') {
            let fileData;
            try {
                fileData         = fs.readFileSync(data);
                conversationData = JSON.parse(fileData);
            } catch (error) {
                throw Error(`[Conversation] Not provided '${data}' JSON file`);
            }
        }

        validateConversationDataFormat(conversationData);
        this.conversationData = conversationData;
        this.currentState = {};
    }

    /**
     * Returns new state of the conversation with provided question, id of the current conversation and answer options
     * @param answer {string} User answer
     * @return {{question: string, id: string, answerOptions: [{answer: string, nextState: string},
     * {answer: string, nextState: string}]}} Current state of the conversation
     */
    reply(answer) {
        // Start from the beginning of the conversation
        if (answer === '' || Object.keys(this.currentState).length === 0
            || !Object.prototype.hasOwnProperty.call(this.currentState, 'answerOptions')) {
            [this.currentState] = this.conversationData;
            return this.currentState;
        }

        // If answer is not provided set unsupported state with question provided in config file
        const answerOption = this.currentState.answerOptions.find(
            (data) => data.answer.toLowerCase() === answer.toLowerCase()
        );
        if (answerOption === undefined) {
            this.currentState   = {
                id: 'unsupportedAnswerEnd',
                question: config.unsupportedAnswer
            };
            return this.currentState;
        }

        // Return next state if it is available, otherwise go back to start
        const newState = this.conversationData.find((data) => answerOption.nextState === data.id);
        this.currentState = newState === undefined ? this.conversationData[0] : newState;

        return this.currentState;
    }
}

module.exports = Conversation;
