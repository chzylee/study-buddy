'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const quizlet = require('./quizlet');
// const store = require('./store');

module.exports = class Flashcards {
    constructor() {
        this.question = '';
    }

    // gets set of flashcards to use for user with given search query
    searchFlashcards(searchQuery) {
        var _this = this;

        return _asyncToGenerator(function* () {
            try {
                var setID = yield quizlet.searchSets(searchQuery);
                return _this.getFlashcards(setID);
            } catch (error) {
                console.error(error);
            }
        })();
    }

    getFlashcards(id) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            try {
                var set = yield quizlet.getSet(id);
                return _this2.parseFlashcards(set);
            } catch (error) {
                console.error(error);
            }
        })();
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

    getTermQuestion(set) {
        // var set = getCurrentSet();
        if (set.length === 0) {
            return 'You have used all the cards in this set.';
        }
        this.question = { // populate answer data with info from set
            q: 'What is the definition of this term: ' + set[0].term + '?',
            a: set[0].definition
        };
        set = set.shift(); // pop card off set
        return this.question.q;
    }

    getDefinitionQuestion(set) {
        // var set = getCurrentSet();
        if (set.length === 0) {
            return 'You have used all the cards in this set.';
        }
        this.question = {
            q: 'What is the term corresponding to this definition: ' + set[0].definition + '?',
            a: set[0].term
        };
        set = set.shift(); // pop card off set
        return this.question.q;
    }

    getImageQuestion(set) {
        // var set = getCurrentSet();
        if (set.length === 0) {
            return 'You have used all the cards in this set.';
        }
        this.question = {
            q: 'What is the term corresponding to this image: ' + set[0].image + '?',
            a: set[0].term
        };
        set = set.shift(); // pop card off set
        return this.question.q;
    }

    getAnswer(guess) {
        // var question = this.dataStore.getData('answer');
        if (guess === this.question.a) {
            return 'Correct! :)';
        } else {
            return 'Incorrect. :(';
        }
    }
};