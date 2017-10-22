const request = require('request');

module.exports = {
    
    // search for sets using given search query and store id of first set found
    searchSets(searchQuery) {
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
            }
            // resolveWithFullResponse: true
        };
    
        return new Promise(function(resolve, reject) {
            request(options, function (error, response, body) {
                if (error) {
                    return reject(error);
                } else{
                    // console.log(response.body);
                    var sets = JSON.parse(response.body).sets;
                    var firstID = sets[0].id;
                    console.log('USING SET ID ' + firstID);
                    // store.setData('currentID', firstID);
                    resolve(firstID);
                }
            });
        });
    },

    getSet(id) {
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
    
        return new Promise(function(resolve, reject) {
            request(options, function(error, response, body) {
                if (error) {
                    return reject(error);
                } else {
                    // console.log(response);
                    var set = JSON.parse(response.body).terms;
                    // console.log('SET :');
                    // console.log(set); 
                    // console.log('set type:');
                    // console.log(typeof set);
                    // store.setData('current', set); // store entire set for future use
                    resolve(set);
                }
            });
        });
    }
}