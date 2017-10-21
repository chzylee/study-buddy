const request = require('request-promise-native');

async function searchSets(searchQuery) {
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

    const results = await request(options)
        .then(function(response) {
            // console.dir(JSON.parse(response.body));
            var sets = JSON.parse(response.body).sets
            return getSet(getSetId(sets));
        });
    return results;
}

function getSetId(sets) {
    if(sets.length > 0) {
        console.log(sets[0].id);
        return sets[0].id;  
    }
    else {
        console.log('Error: NO SETS FOUND');
        return undefined;
    }
}

async function getSet(id) {
    if(id === undefined) {
        return;
    }
    var options = {
        method: 'GET',
        uri: 'https://api.quizlet.com/2.0/sets/' + id,
        headers: {
            Authorization: 'Bearer ' + process.env.QUIZLET_ACCESS_TOKEN
        }
    };

    const set = await request(options)
    .then(function(response) {
        // console.dir(JSON.parse(response));
        var resp = JSON.parse(response);
        console.log(resp.terms);
    });
    return set;
}

module.exports = {
    searchSets: searchSets,
    getSetId: getSetId,
    getSet: getSet
}