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
const _flashcards = require('./flashcards');
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
function handleMessage(sender_psid, received_message) {
    let response;
    console.log('received message: ' + received_message);

    // Check if the message contains text
    if (received_message.text) {
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
            console.log(subZero);
            response = {
              "text": 'Ok, let\'s study ' + query + "\!"
            }
            state = 'need flashcards';
        } else if (state === 'need flashcards') {
            set = dealer.getCards()
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
