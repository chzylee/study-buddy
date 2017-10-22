'use strict';

// Imports dependencies and set up http server
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // creates express http server

// global variables
var state = 'idle';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const dealer = require('./lib/dealer');
const _flashcards = require('./lib/flashcards');
var flashcards = new _flashcards();
var set = [];

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

    let body = req.body;
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
        // console.log(body); // for debugging

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the message. entry.messaging is an array, but
            // will only ever contain one message, so we get index 0
            let webhookEvent = entry.messaging[0];
            console.log(webhookEvent);

            // Get the sender PSID
            let sender_psid = webhookEvent.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhookEvent.message) {
              handleMessage(sender_psid, webhookEvent.message);
            } else if (webhookEvent.postback) {
              handlePostback(sender_psid, webhookEvent.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

   // Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "GZ99W5DZ8A"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

// Handles messages events
async function handleMessage(sender_psid, received_message) {
    let response;
    console.log('received message: ' + received_message);

    // Check if the message contains text
    if (received_message.text) {
        var receivedText = received_message.text;
        if(receivedText.toLowerCase() === 'bye') {
            response = {
              "attachment": {
                "type":"template",
                "payload": {
                  "template_type":"generic",
                  "elements":{
                    "title":"Good bye!",
                    "image_url":"http://www.sherv.net/cm/emo/funny/2/big-dancing-banana-smiley-emoticon.gif"
                  }
                }
              //  "title": 'Good bye!',
              }
            }
            state = 'idle';
        } else if (receivedText.toLowerCase() === 'banana') {
            response = {
              "attachment": {
                "type": "image",
                "payload":{
                  "url":"http://www.sherv.net/cm/emo/funny/2/big-dancing-banana-smiley-emoticon.gif"
                }
              }
            }
        } else {
            // Create the payload for a basic text message
            if (state === 'idle') {
                // Check for greeting
                console.log('looking for greeting');
                const greetings = firstEntity(received_message.nlp, 'greetings');
                if (greetings && greetings.confidence > 0.8) {
                    console.log('detected greeting');
                    response = {
                        "text": 'Hey there! What would you like to study?'
                    }
                    state = 'need query';
                }
            } else if (state === 'need query') {
                const query = firstEntity(received_message.nlp, 'message_subject').value;
                // console.log(query);
                set = await dealer.getCards(query);
                console.log('pulling flashcards');
                response = {
                    "text": 'Okay! I got the ' + query + ' flashcards to study! Tell me when to start.'
                            + ' Just say "stop this set" if you ever want to stop a deck of cards, or say "bye"'
                            + ' at any point if you want to stop.'
                };
                state = 'asking questions';
            } else if (state === 'asking questions') {
                if (receivedText.toLowerCase() === 'stop this set') {
                    response = {
                        "text": 'Ok! I will stop using this set. What would you like to study next?'
                    }
                    state = 'need query';
                }
                else {
                    if (set.length === 0) {
                        response = {
                            "text": 'That\'s all the terms in this set! What would you like to study next?'
                        }
                        state = 'need query';
                    }
                    else {
                        var question = flashcards.getTermQuestion(set); // can be replaced with other kind of questions
                        response = {
                            "text": question
                        }
                        state = 'awaiting answer'
                    }
                }
            } else if (state === 'awaiting answer') {
                // var guess = firstEntity(received_message.nlp, 'message_subject').value;
                var guess = received_message.text;
                if (receivedText.toLowerCase() === 'stop this set') {
                    response = {
                        "text": 'Ok! I will stop using this set. What would you like to study next?'
                    }
                    state = 'need query';
                } else {
                    var correct = flashcards.getAnswer(guess);
                    if (correct === 1){
                        response = {
                            "text": 'That\'s right\! Tell me when to go to the next one. There are ' + set.length + ' cards left in this set.'
                        }
                    } else {
                        response = {
                            "text": 'Sorry, the correct answer is ' + correct + '. Tell me when to go to the next one. There are '
                                    + set.length + ' cards left in this set.'
                        }
                    }
                    state = 'asking questions';
                }
            }
        }
    }
    // Sends the response message
    callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
        "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
        console.log('message sent!')
        } else {
        console.error("Unable to send message:" + err);
        }
    });
}

function firstEntity(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}
