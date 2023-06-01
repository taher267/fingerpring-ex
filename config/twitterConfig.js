const Twitter = require('twitter');
const TwitterV2 = require('twitter-v2');
const OAuth = require('oauth');


let twitterConsumerKey = process.env.CONSUMER_KEY;
let twitterConsumerSecret = process.env.CONSUMER_SECRET;

exports.consumer = new OAuth.OAuth(
  'https://twitter.com/oauth/request_token',
  'https://twitter.com/oauth/access_token',
  twitterConsumerKey,
  twitterConsumerSecret,
  '1.0A',
  // "http://localhost:5000/sessions/callback",
  'https://node.tweetsy-backend.com/sessions/callback',
  'HMAC-SHA1'
);

/**
 *
 * @param {accessToken} access_token_key
 * @param {accessTokenSecret} access_token_secret
 * @returns
 */
exports.clientTwit = (access_token_key, access_token_secret) =>
  new Twitter({
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    access_token_key,
    access_token_secret,
  });
