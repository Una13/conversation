## Conversation class
Conversation is Javascript class which implements state management for a troubleshooting
chat bot. A basic operating principle is that the chat bot starts the conversation by asking a question about the user's
problem and presents pre-defined options for the user to choose from. When the user chooses one of the presented
options, the chat bot asks a new question with new options to find out more about the visitors problem. This
conversation continues until an end stateis reached. An end state is a state without answer options.

#### Usage
```javascript
let conv = new Conversation('./troubleshooting.json');
conv.reply('');  // Returns start state
conv.reply('My phone doesn\'t work');  // Returns phoneModel state
conv.reply('Samsung Galaxy S10');  // Returns samsungServiceEnd state
```

Parameter of the constructor must be the path to the conversation schema which includes list of states.
Document is a list of states which have id, question and a list of answer options. Each answer option has the answer text and an id of the next
state. Only valid JSON object will be processed.\
JSON must be array of states in the following format:
```json
{
    "id": "start",
    "question": "What kind of problem are you facing?",
    "answerOptions": [
      {
        "answer": "My internet doesn't work",
        "nextState": "routerReset"
      },
      {
        "answer": "My phone doesn't work",
        "nextState": "phoneModel"
      }
    ]
}
```

In the case of unsupported answer, question is read from the `config.json` file and will lead user to the end of the conversation.

#### Test
In order to test class functionality run following commands:

    $ npm install
    $ npm run test
