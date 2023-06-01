const { clientTwit, clientTwitLite } = require('../config/twitterConfig');
const error = require('../utils/error');

/**
 *
 * @param {string} token required
 * @param {string} token_secret required
 * @param {string} apiName required
 * @param {string||object} options required
 * @returns {object}
 */

exports.twitApi = async (token, token_secret, apiName, options) => {
  const client = clientTwit(token, token_secret);
  switch (apiName) {
    case `statusesUserTimeline`:
      return client.get(`statuses/user_timeline`, options);
    case `usersLookup`:
      return client.get(`users/lookup`, options);
    case `followersIds`:
      return client.get(`followers/ids`, options);

    case `statusesUpdate`:
      return client.post('statuses/update', options);
    // return new Promise((resolve, reject) =>
    //   client.post('statuses/update', options, (err, updated) => {
    //     if (err) {
    //       return reject(err);
    //     }
    //     return resolve(updated);
    //   })
    // );
    case `mediaUpload`:
      // return client.post('media/upload', options);
      return new Promise((resolve, reject) =>
        client.post('media/upload', options, (err, data) => {
          if (err) return reject(err);
          return resolve(data);
        })
      );
    case `statusesDestroy`:
      return client.post('statuses/destroy', options);
    default:
      return false;
  }
};
