const request = require('request');

module.exports = {
    searchSet(searchQuery) {
        var options = {
            method: 'GET',
            uri: 'https://api.quizlet.com/2.0/search/sets',
            headers: {
                Authorization: 'Bearer GTph6BmbGUZ6PgcRx29STBMBhcJSbSp3pxeD47N4'
            },
            qs: {
                whitespace: true,
                q: searchQuery,
                per_page: 5
            }
        };
    
        request(options, function(error, response, body) {
            if(error){
                console.log('error:');
                console.log(error);
            }
            
            console.log('response:');
            // console.log(body);
            var set = JSON.parse(body).sets[0];
            console.log(set);
        });
    },
    
    getSet(id) {
        var options = {
            method: 'GET',
            uri: 'https://api.quizlet.com/2.0/sets/' + id,
            headers: {
                Authorization: 'Bearer GTph6BmbGUZ6PgcRx29STBMBhcJSbSp3pxeD47N4'
            }
        };
    
        request(options, function(error, response, body) {
            // console.log('error:');
            // console.log(error);
            console.log('set ' + id + ':');
            console.log(JSON.parse(body).terms);
        });
    }
}