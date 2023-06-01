const moment = require("moment");
const User = require("../models/User");
const { schedule } = require("node-cron");

const func = async () => {
  try {
    // const and = [
    //   { createdAt: { $gt: Date.now() - 86400000 * 5 } },
    //   { createdAt: { $lt: Date.now() } },
    // ];

    const users = await User.aggregate([
      {
        $match: {
          // createdAt: {
          //   $gt: new Date(Date.now() - 86400000 * 11),
          //   $lt: new Date(Date.now() - 86400000 * 5),
          // },
          status: "Active",
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "userId",
          as: "Payments",
        },
      },
      // { $unwind: '$Payments' },
      {
        $project: {
          createdAt: 1,
          email: 1,
          id: 1,
          _id: 1,
          paymentIds: "$Payments.current_period_end",
        },
      },
    ]);
    users.forEach(async ({ createdAt, _id, paymentIds, email }) => {
      if (paymentIds?.length) {
        // let paymentEnd = paymentIds[0] * 1000;
        // let stripeExpiry = moment(paymentEnd).diff(moment(), 'days');
        // let mailMsg;
        // if (stripeExpiry === 2) {
        //   mailMsg = `Payment expire will be ${moment(paymentEnd).format(
        //     'YYYY-MM-DD, HH:mm:ss'
        //   )}`;
        // } else if (stripeExpiry === 0) {
        //   mailMsg = `Payment expire will be today at, ${moment(
        //     paymentEnd
        //   ).format('HH:mm:ss')}`;
        // } else if (stripeExpiry === -3) {
        //   mailMsg = `Payment expired at: ${moment(paymentEnd).format(
        //     'YYYY-MM-DD, HH:mm:ss'
        //   )}`;
        // }
      } else {
        let mailMsg;
        let start_Date = moment(createdAt);
        let totalDays = moment().diff(start_Date, "days");
        if (totalDays === 10) {
          mailMsg = `Please subscribe, your trail has been expired on: ${moment(
            createdAt
          )
            .add(10, "days")
            .format("YYYY-MM-DD, HH:mm:ss")}`;
        } else if (totalDays === 7) {
          mailMsg = `Please subscribe, today trail expired on: ${moment(
            createdAt
          )
            .add(7, "days")
            .format("YYYY-MM-DD, HH:mm:ss")}`;
        } else if (totalDays === 5) {
          mailMsg = `Please subscribe, trail expire soon: ${moment(createdAt)
            .add(7, "days")
            .format("YYYY-MM-DD, HH:mm:ss")}`;
        }
        if (mailMsg) {
          if ((process.env.NODE_ENV = "development")) {
            console.log(mailMsg);
          } else {
            await sendEmail(email, `Subscription Expiry`, mailMsg);
          }
        }
      }
    });
  } catch (e) {
    console.log(e.message);
  }
};
module.exports = schedule(
  "* */2 * * *",
  // '0 0 * * *',
  func,
  null,
  false
  // 'America/Los_Angeles'
);
