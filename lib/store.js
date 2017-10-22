"use strict";

module.exports = class Store {
    constructor() {
        this.data = new Map(); // dict of data for general use
        this.setCounts = new Map(); // dict of  id:numUses pairs to count uses of sets
    }

    // returns number of uses for given set
    getSetUses(id) {
        return this.setCounts.get(id);
    }

    // count the use of given flashcard set
    countSetUse(id) {
        if (this.setCounts.get(id) == undefined) {
            this.setCounts.set(id, 1);
        } else {
            this.setCounts.set(id, this.setCounts.get(id) + 1);
        }
    }

    // set data within store
    setData(key, data) {
        this.data.set(key, data);
    }

    // return data with given key
    getData(key) {
        return this.data.get(key);
    }
};