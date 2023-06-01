const { sign } = require("jsonwebtoken");
const Payment = require("../models/Payment");
const PaymentSubs = require("../models/PaymentSubs");
const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const stripe = require("../utils/stripe");
const moment = require("moment");

const getPrices = async (req, res) => {
  const prices = await stripe.prices.list();
  res.send({ prices });
};

async function createPayment(id) {
  let subsId, payId;
  try {
    const userId = id;
    const subsDemo = {
      type: "lifetime",
      userId,
      planId: "6460579a20da39dea353b94f",
      credit: 3,
      price: 13,
      expire: moment().add(1, "month").valueOf(),
      visitors: 1500,
    };
    const paymentDemo = {
      userId,
      subscription: "sub_1MQcgmCx996FZZgaRPwWEwTt",
      amount: 1300,
      currency: "usd",
      email: "tahertweetsy@gmail.com",
      // phone,
      name: "Abu Taher",
      invoice: "fjskjfskajfksadjfkds",
      payment_status: "paid",
      payment_method_types: ["card"],
      status: "complete",
      current_period_start: 1673812116 * 1000,
      current_period_end: 1676490516 * 1000,
      quantity: 1,
      customer: "cus_NAy7dnYm7wmDIb",
      product: "prod_NAoL1sJDQVIDm3",
    };
    const subs = await Subscription.create(subsDemo);
    // subsId = subs.id;
    // // console.log(subsId)
    // const pay = await Payment.create(paymentDemo);
    // payId = pay.id;
    // const paymentSubsDemo = {
    //   paymentId: pay.id,
    //   subscriptionId: subs.id,
    // };
    // const paysubs = await PaymentSubs.create(paymentSubsDemo);
    // console.log(paysubs);
  } catch (e) {
    console.log(e.message);
    if (subsId) await Subscription.findByIdAndDelete(subsId);
    if (payId) await Payment.findByIdAndDelete(payId);
    // if (paySubId) await PaymentSubs.findByIdAndDelete(paySubId);
  }
}

// createPayment("64605628a6b4c4b7f4a7acfe");
const createSession = async (req, res) => {
  const { origin } = req.headers;
  let { email } = req.body;
  let { _id } = req.user;
  const env = process.env.NODE_ENV;
  try {
    const payement = await Payment.findOne({ userId: _id })
      .select("customer")
      .exec();

    // console.log(user);
    // return res.sendStatus(400);

    // let stripeCustomerId = user.stripeCustomerId;
    let customer = payement?.customer || payement?._doc?.customer;
    if (!customer) {
      let { id } = await stripe.customers.create(
        {
          email,
        },
        // {
        //   apiKey: process.env.STRIPE_SECRET_KEY,
        // }
      );
      customer = id;
    }

    const hash = sign(
      {
        inf: JSON.stringify({
          s_id: `${customer}.${_id.toString()}`,
        }),
      },
      process.env.JWT_STRIPE_USER_SECRET,
      {
        expiresIn: process.env.JWT_STRIPE_USER_EXPIRE,
      }
    );
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        payment_method_types: ["card"],
        currency: "usd",
        allow_promotion_codes: true,
        line_items: [
          {
            price: req.body.priceId,
            quantity: 1,
          },
        ],
        success_url: `${origin}/subscription?AlhamduLillah=${hash}`,
        cancel_url: `${origin}/subscription`,
        customer,
      },
      // {
      //   apiKey: process.env.STRIPE_SECRET_KEY,
      // }
    );
    // const userData = { ...req.user };
    // delete userData.password;
    // delete userData.OTP;
    // delete userData.OTPExpiry;
    // delete userData.createdAt;
    // delete userData.updatedAt;
    // delete userData.__v;
    // console.log(session);
    return res.json(session);
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong" });
  }
};

const checkSubscription = async (req, res) => {
  try {
    // cus_N1rrRs7p3pfHTy
    const user = await User.findOne({ user_email: req.body.email });
    if (user.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list(
        {
          customer: user.stripeCustomerId,
          status: "all",
          expand: ["data.default_payment_method"],
        },
        // {
        //   apiKey: process.env.STRIPE_SECRET_KEY,
        // }
      );

      if (subscriptions?.data?.length == 0) {
        return res.send({
          data: {
            havePlan: false,
          },
        });
      }
      const userData = { ...req.user };
      delete userData.password;
      delete userData.OTP;
      delete userData.OTPExpiry;
      delete userData.createdAt;
      delete userData.updatedAt;
      delete userData.__v;
      res.send({
        user: userData,
        data: {
          havePlan: true,
          created: subscriptions?.data[0].created * 1000,
          current_period_start:
            subscriptions?.data[0].current_period_start * 1000,
          current_period_end: subscriptions?.data[0].current_period_end * 1000,
          email: subscriptions?.data[0].email,
          name: subscriptions?.data[0].name,
          plan: subscriptions?.data[0].plan,
          // subscriptions: subscriptions.data[0],
        },
      });
    } else {
      return res.send({
        data: {
          havePlan: false,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      isSuccess: false,
    });
  }
};


//cancelSubscription
const cancelSubscription = async (req, res) => {
  try {
    const customerID = req.body.customerID;
    // https://stackoverflow.com/questions/63886638/stripe-cancel-a-subscription-in-js
    /*
        // Set your secret key. Remember to switch to your live secret key in production.
        // See your keys here: https://dashboard.stripe.com/apikeys
        const stripe = require('stripe')('sk_test_51M0QGtCx996FZZgar0EDav42cUAomy2QXE4UIeae8WglFKFD7VtyfUx2Jkgkaw9hEMyJ9pPLZ2eqJbngBHZdkozK00YBZqs9VM');

        stripe.subscriptions.update('sub_49ty4767H20z6a', {cancel_at_period_end: true});
    */
  } catch (err) {
    res.status.send({ isSuccess: false });
  }
};

const stripeWebHook = async (req, res) => {
  const { origin } = req.headers;
  if (origin) {
    await sendEmail(
      "tahertweetsy@gmail.com",
      "check origin",
      `origin:${origin}=> ${JSON.stringify(req.headers)}`
    );
  }

  const allowMailSend = process.env.ALLOW_PAYMENT_MAIL;
  let session;
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  /////////////////////////////////////////
  // switch (event.type) {
  //   case "checkout.session.async_payment_succeeded":
  //     session = event.data.object;
  //     // console.log(session, 'checkout.session.async_payment_succeeded');
  //     // Then define and call a function to handle the event checkout.session.async_payment_succeeded
  //     break;
  //   case "checkout.session.completed":
  //     session = event.data.object;
  //     // console.log(session, 'checkout.session.completed');
  //     // Then define and call a function to handle the event checkout.session.completed
  //     break;
  //   // ... handle other event types
  //   default:
  //     console.log(`Unhandled event type ${event.type}`);
  // }
  ////////////////////////////////////////////
  session = event?.data?.object;
  if (
    event.type === "checkout.session.completed" &&
    session?.customer_details?.email
  ) {
    const user = await User.findOne({
      email: session.customer_details.email,
    })
      .select("uid displayName")
      .exec();

    const displayName = user?._doc?.displayName;

    if (user) {
      let { _id } = user._doc;
      let email = session?.customer_details?.email;
      let client = session?.customer;

      if (client) {
        let {
          subscription, //new
          amount_subtotal,
          // amount: 'amount_subtotal',
          customer,
          currency,
          customer_details: { email, phone, name },
          invoice, // new
          payment_status, //new
          status,
          payment_method_types, //array
        } = session;

        let newData = {
          subscription,
          amount: amount_subtotal,
          currency,
          email,
          phone,
          name,
          invoice,
          payment_status,
          payment_method_types,
          status,
          userId: _id,
          customer,
        };
        stripe.subscriptions
          .list(
            {
              customer,
              status: "all",
              expand: ["data.default_payment_method"],
            },
            // {
            //   apiKey: process.env.STRIPE_SECRET_KEY,
            // }
          )
          .then(async ({ data }) => {
            let {
              quantity,
              current_period_end,
              current_period_start,
              plan: {
                product,
                interval,
                // amount
              },
            } = data[0];
            let offerPlan = await Plan.findOne({ prodId: product })
              .select("credit visitors")
              .exec();

            let newPaymentData = {
              ...newData,
              current_period_end,
              current_period_start,
              quantity,
              product,
            };
            // console.log(newPaymentData);
            let newSubscription = {
              type: `${interval}ly`,
              userId: _id,
              planId: offerPlan?._id || _id, //
              credit: offerPlan?.credit || offerPlan?._doc?.credit || 1,
              price: amount_subtotal / 100,
              expire: current_period_end * 1000,
              visitors: offerPlan?.visitors || offerPlan?._doc?.visitors,
            };
            let IsExistPayment = await Payment.findOne({ userId: _id })
              .select("_id")
              .exec();
            if (IsExistPayment) {
              delete newPaymentData.userId;
              await Payment.updateOne({ userId: _id }, newPaymentData);
              delete newSubscription.userId;
              await Subscription.updateOne({ userId: _id }, newSubscription);

              if (newData.email && allowMailSend) {
                const message = `
                <h2>Hey ${displayName},</h2>
                <p>Payment has been completed</p>
                <p>Plan: ${newSubscription.type}</p>
                <p>Plan Expiry: ${moment(newSubscription.expire)
                    .utc()
                    .format("YYYY-MM-DD, HH:mm")}</p>
                  <p>Credit: ${newSubscription.credit}</p>`;

                await sendEmail(newData.email, `Payment info`, message);
              }
            } else {
              // create Payment
              let paymentCreate = await Payment.create(newPaymentData);

              if (paymentCreate) {
                //paymentCreate
                let newSubs = await Subscription.create(newSubscription);
                if (newSubs) {
                  // newSubs
                  let newPaymentSubsData = {
                    paymentId: paymentCreate._id,
                    subscriptionId: newSubs._id,
                  };
                  let paymentSybsCreated = await PaymentSubs.create(
                    newPaymentSubsData
                  );
                  if (paymentSybsCreated) {
                    if (newData.email && allowMailSend) {
                      const message = `
                    <h2>Hey ${displayName},</h2>
                    <p>Payment has been completed</p>
                    <p>Plan: ${newSubscription.type}</p>
                    <p>Plan Expiry: ${moment(newSubscription.expire)
                          .utc()
                          .format("YYYY-MM-DD, HH:mm")}</p>
                      <p>Credit: ${newSubscription.credit}</p>`;

                      await sendEmail(newData.email, `Payment info`, message);
                    }
                  } else {
                    await sendEmail(
                      null,
                      "Stripe WebHook and PaymentSubs Error",
                      `<p>${JSON.stringify(newPaymentSubsData)}</p>`
                    );
                  }
                  return res.send();
                } else {
                  // await sendEmail(
                  //   null,
                  //   'Stripe WebHook and createPaymentSubs Error',
                  //   `<p>${newSubscription}</p>`
                  // );
                }
              } else {
                console.log(`else if paymentCreate`);
                await sendEmail(
                  null,
                  "Stripe WebHook and createSubscription Error",
                  `<p>${newPaymentData}</p>`
                );
                return res.send();
              }
            }
          })
          .catch(async (e) => {
            await sendEmail(null, "Stripe WebHook Error", `<p>${e}</p>`);
          });
      } else {
        console.log(session);
      }
    }
  }

  // Return a 200 res to acknowledge receipt of the event
  res.send();
};

module.exports = {
  getPrices,
  createSession,
  checkSubscription,
  cancelSubscription,
  stripeWebHook,
  createPayment
};
