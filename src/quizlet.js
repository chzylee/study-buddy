const request = require('request-promise-native');

// searches Quizlet for set of cards using given query and passes on store for storage of data
async function searchSets(searchQuery, store) {
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
            store.setData(searchQuery, sets);
            if(sets.length > 0) {
                console.log('USING SET ID ' + sets[0].id);
                return getSet(sets[0].id, store);
            } else {
                console.log('Error: NO SETS FOUND');
            }
        });
    return results;
}

async function getSet(id, store) {
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
        var set = JSON.parse(response).terms;
        console.log('USING SET :');
        console.log(set); 
        store.setData('current', set); // store entire set for future use
    });
    return set;
}

module.exports = {
    searchSets: searchSets,
    getSet: getSet
}