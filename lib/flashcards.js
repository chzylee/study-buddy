'use strict';

const quizlet = require('./quizlet');
const store = require('./store');

module.exports = class Flashcards {
    constructor() {
        this.dataStore = new store();
    }

    // gets set of flashcards to use for user with given search query
    getFlashcards(searchQuery) {
        // find sets
        quizlet.searchSets(searchQuery, this.dataStore);
    }
};