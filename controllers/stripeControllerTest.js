const { sign } = require("jsonwebtoken");
const Payment = require("../models/Payment");
const PaymentSubs = require("../models/PaymentSubs");
const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const stripe = require("../utils/stripe");
// const { single, double } = require('./stripePaymentSample');
// console.log(JSON.stringify(double).length);
//get products


const stripeWebHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  let message;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.async_payment_failed":
      const checkoutSessionAsyncPaymentFailed = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_failed
      message = checkoutSessionAsyncPaymentFailed;
      break;
    case "checkout.session.async_payment_succeeded":
      const checkoutSessionAsyncPaymentSucceeded = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_succeeded
      message = checkoutSessionAsyncPaymentFailed;
      break;
    case "checkout.session.completed":
      const checkoutSessionCompleted = event.data.object;
      // Then define and call a function to handle the event checkout.session.completed
      message = checkoutSessionCompleted;
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  console.log(message);
  // Return a 200 res to acknowledge receipt of the event
  res.send();
};

module.exports = {
  stripeWebHook,
};
