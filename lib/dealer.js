'use strict';

const _flashcards = require('./flashcards');

module.exports = {
    getCards(searchQuery) {
        var flashcards = new _flashcards();
        return new Promise(function (resolve, reject) {
            if (searchQuery === undefined) {
                reject(0);
            } else {
                resolve(flashcards.searchFlashcards(searchQuery));
            }
        });
    }
};