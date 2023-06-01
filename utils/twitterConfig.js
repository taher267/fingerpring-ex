// ALL REQUIRES
const Twitter = require('twitter');

// TWITTER NPM PACKAGE CONFIG
exports.TwitterClient = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.CENTRAL_TOKEN,
    access_token_secret: process.env.CENTRAL_TOKEN_SECRET
});