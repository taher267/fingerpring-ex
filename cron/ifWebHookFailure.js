const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const sendEmail = require('../utils/sendEmail');
const stripe = require('../utils/stripe');
const { schedule } = require('node-cron');

// Invalid status: must be one of active, past_due, unpaid, canceled, incomplete, incomplete_expired, trialing, all, or ended

const func = async () => {
  console.log('check subs, payment', moment());
  try {
    const payments = await Payment.find({
      current_period_end: { $lt: Date.now().valueOf() / 1000 },
    }).exec();
    payments.forEach(
      async ({ customer, current_period_end: expiry, userId }) => {
        if (customer) {
          stripe.subscriptions
            .list(
              {
                customer,
                status: 'all',
                expand: ['data.default_payment_method'],
              },
              {
                apiKey: process.env.STRIPE_SECRET_KEY,
              }
            )
            .then(async (expireCustomer) => {
              for (const subsData of expireCustomer?.data || []) {
                if (subsData.current_period_end === expiry) {
                  // should be changed >
                  let {
                    id,
                    currency,
                    latest_invoice,
                    status,
                    current_period_end,
                    current_period_start,
                    default_payment_method: {
                      billing_details: { email, name, phone },
                    },
                    plan: { product, interval, amount },
                    quantity,
                  } = subsData;
                  let offerPlan = await Plan.findOne({ prodId: product })
                    .select('credit')
                    .exec();
                  let paymentUpdate = {
                    subscription: id,
                    amount,
                    currency,
                    email,
                    phone,
                    name,
                    invoice: latest_invoice,
                    status,
                    current_period_end,
                    current_period_start,
                    // product,
                    quantity,
                  };
                  let updateSubscription = {
                    type: `${interval}ly`,
                    price: amount / 100,
                    expire: current_period_end * 1000,
                  };
                  if (offerPlan?._doc?.prodId) {
                    paymentUpdate.product = product; // Should be remove
                    if (product !== offerPlan?._doc?.prodId) {
                      updateSubscription.planId = product;
                      updateSubscription.credit =
                        offerPlan?.credit || offerPlan?._doc?.credit || 1;
                      paymentUpdate.product = product;
                    }
                  } else {
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`There is no product of stripe prod_id`);
                    } else {
                      await sendEmail(
                        null,
                        'Cron if Weebhook failure',
                        `<div>${product}, can not find in Database</div>`
                      );
                    }
                    return;
                  }
                  await Payment.updateOne({ userId }, paymentUpdate);
                  await Subscription.updateOne({ userId }, updateSubscription);
                  if (process.env.NODE_ENV === 'development')
                    console.log(
                      `Alhamu lillah, Payment & Subscription has been updated sucessfully`
                    );
                }
              }
            })
            .catch(async (stripeErr) => {
              if (process.env.NODE_ENV === 'development') {
                console.log(stripeErr, 'stripeErr', stripeErr.message);
              } else {
                await sendEmail(
                  null,
                  'Cron if Weebhook failure, stripe Error',
                  `<div>
                  <h2>${stripeErr.message}</h2>
                  ${JSON.stringify(stripeErr)}
                  </div>`
                );
              }
            });
        }
      }
    );
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.log(e.message);
    } else {
      await sendEmail(
        null,
        'Cron if Weebhook failure, immediate error',
        `<div>
      <h2>${e.message}</h2>
      ${JSON.stringify(e)}
      </div>`
      );
    }
  }
};
// func();
module.exports = schedule(
  '* */2 * * *',
  func
  // null,
  // false,
  // 'America/Los_Angeles'
);
