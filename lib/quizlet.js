'use strict';

let searchSets = (() => {
    var _ref = _asyncToGenerator(function* (searchQuery) {
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
            return getSet(getSetId(sets));
        });
        return results;
    });

    return function searchSets(_x) {
        return _ref.apply(this, arguments);
    };
})();

let getSet = (() => {
    var _ref2 = _asyncToGenerator(function* (id) {
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
            var resp = JSON.parse(response);
            console.log(resp.terms);
        });
        return set;
    });

    return function getSet(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const request = require('request-promise-native');

function getSetId(sets) {
    if (sets.length > 0) {
        console.log(sets[0].id);
        return sets[0].id;
    } else {
        console.log('Error: NO SETS FOUND');
        return undefined;
    }
}

module.exports = {
    searchSets: searchSets,
    getSetId: getSetId,
    getSet: getSet
};