// All Requires
const OAuth = require('oauth');
let twitterConsumerKey = process.env.CONSUMER_KEY;
let twitterConsumerSecret = process.env.CONSUMER_SECRET;

// Consumer Function
exports.consumer = () => {
    return new OAuth.OAuth(
        "https://twitter.com/oauth/request_token",
        "https://twitter.com/oauth/access_token",
        twitterConsumerKey,
        twitterConsumerSecret,
        "1.0A",
        "http://localhost:5000/auth/sessions/callback",
        // "https://node.tweetsy-backend.com/sessions/callback",
        "HMAC-SHA1"
    )
}