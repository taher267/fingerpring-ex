const stripe = require("stripe");
// STRIPE_SECRET_KEY_LIVE
module.exports = stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
  // apiVersion: process.env.NODE_ENV === 'development' ? '2022-11-15' : '2020-08-27',
});
