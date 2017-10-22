const quizlet = require('./quizlet');
// const store = require('./store');

module.exports = class Flashcards {
    constructor() {
       this.question = '';
    }

    // gets set of flashcards to use for user with given search query
    async searchFlashcards(searchQuery) {
        try {
            var setID = await quizlet.searchSets(searchQuery);
            return this.getFlashcards(setID);
        } catch (error) {
            console.error(error);
        }
    }

    // gets the set of flashcards and passes to parser
    async getFlashcards(id) {
        try {
            var set = await quizlet.getSet(id);
            return this.parseFlashcards(set);
        } catch (error) {
            console.error(error);
        }
    }

    // parse deck of cards to thin data
    parseFlashcards(set) {
        var parsedSet = [];
        for (var i = 0; i < set.length; i++) {
            parsedSet.push({
                term: set[i].term,
                definition: set[i].definition,
                image: set[i].image.url
            });
        }
        // console.log('PARSED SET:');
        // console.log(parsedSet);
        // console.log(set.length);
        return parsedSet;
    }

    // returns question about the term on the top card
    getTermQuestion(set) {
        // var set = getCurrentSet();
        if (set.length === 0) {
            return 0;
        }
        this.question = { // populate answer data with info from set
            q: 'What is the definition of the term: ' + set[0].term + '?',
            a: set[0].definition
        }
        set = set.shift(); // pop card off set
        return this.question.q;
    }

    // returns question about the defition on the top card
    getDefinitionQuestion(set) {
        // var set = getCurrentSet();
        if (set.length === 0) {
            return 0;
        }
        this.question = {
            q: 'What is the term corresponding to this definition: ' + set[0].definition + '?',
            a: set[0].term
        }
        set = set.shift(); // pop card off set
        return this.question.q;
    }

    // return question about the image on the card
    getImageQuestion(set) {
        if (set.length === 0) {
            return 0;
        }
        this.question = {
            q: 'What is the term corresponding to this image: ' + set[0].image + '?',
            a: set[0].term
        }
        set = set.shift(); // pop card off set
        return this.question.q;
    }

    // return a random question
    getRandomQuestion(set) {
        var i = Math.ceil(Math.random() * (2));
        if (i === 0) {
            return getTermQuestion(set);
        } else if (i === 1) {
            return getDefinitionQuestion(set);
        } else {
            return getImageQuestion(set);
        }
    }
    
    // return info about answer correctness
    getAnswer(guess) {
        // var question = this.dataStore.getData('answer');
        if (guess === this.question.a) {
            return 1;
        }
        else {
            return 0;
        }
    }
}