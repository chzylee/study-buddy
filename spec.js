const quizlet = require('./lib/quizlet');
const store = require('./lib/store');
const flashcards = require('./lib/flashcards');
const dealer = require('./lib/dealer');

async function main(){
    // console.log(process.env.QUIZLET_ACCESS_TOKEN);
    // var mystore = new store();
    var mycards = new flashcards();
    // var set = mycards.searchFlashcards('portuguese');
    var running = 2;
    var state = 'starting'
    var set = [];
    while (running) {
        switch (state) {
            case 'starting':
                set = await dealer.getCards('portuguese'); // wait for set to return
                // console.log(set);
                state = 'has set';
                break;
            case 'has set':
                console.log('QUESTION: ' + mycards.getTermQuestion(set));
                state = 'waiting for answer';
                break;
            case 'waiting for answer':
                var guess = 'film';
                console.log('GUESS: ' + guess);
                state = 'checking answer';
                break;
            case 'checking answer':
                console.log(mycards.getAnswer(guess));
                state = 'has set';
                running -= 1;
            default:
                break;
        }
    }
    
};

main();