'use strict';

// searches Quizlet for set of cards using given query and passes on store for storage of data
let searchSets = (() => {
    var _ref = _asyncToGenerator(function* (searchQuery, store) {
        var options = {
            method: 'GET',
            uri: 'https://api.quizlet.com/2.0/search/sets',
            headers: {
                Authorization: 'Bearer ' + process.env.QUIZLET_ACCESS_TOKEN
            },
            qs: {
                whitespace: true,
                q: searchQuery,
                per_page: 5
            },
            resolveWithFullResponse: true
        };

        const results = yield request(options).then(function (response) {
            // console.dir(JSON.parse(response.body));
            var sets = JSON.parse(response.body).sets;
            store.setData(searchQuery, sets);
            if (sets.length > 0) {
                console.log('USING SET ID ' + sets[0].id);
                return getSet(sets[0].id, store);
            } else {
                console.log('Error: NO SETS FOUND');
            }
        });
        return results;
    });

    return function searchSets(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let getSet = (() => {
    var _ref2 = _asyncToGenerator(function* (id, store) {
        if (id === undefined) {
            return;
        }
        var options = {
            method: 'GET',
            uri: 'https://api.quizlet.com/2.0/sets/' + id,
            headers: {
                Authorization: 'Bearer ' + process.env.QUIZLET_ACCESS_TOKEN
            }
        };

        const set = yield request(options).then(function (response) {
            // console.dir(JSON.parse(response));
            var set = JSON.parse(response).terms;
            console.log('USING SET :');
            console.log(set);
            store.setData('current', set); // store entire set for future use
        });
        return set;
    });

    return function getSet(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const request = require('request-promise-native');

module.exports = {
    searchSets: searchSets,
    getSet: getSet
};