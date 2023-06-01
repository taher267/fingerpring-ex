const { Types } = require("mongoose");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Plan = require("../models/Plan");
const Payment = require("../models/Payment");
const PaymentSubs = require("../models/PaymentSubs");
const moment = require("moment");
const { ALLOW_TRAIL } = require("../config");

// const datas = [
//   {
//     // _id: new ObjectId("6463b8e0a3a6e6f16d7447e4"),
//     type: "monthly",
//     // planId: new ObjectId("6463ad5764ec8976225e5834"),
//     credit: 5,
//     expire: new Date("2023-06-16T16:30:30.000Z"),
//     createdAt: new Date("2023-05-16T17:09:52.772Z"),
//     product: ["prod_NuENkdbNlQN0kx"],
//     currentSubs: 1684254630,
//   },
//   {
//     // _id: new ObjectId("6463bbaa0df08690bcae6cd7"),
//     type: "lifetime",
//     // planId: new ObjectId("6463b99033d362deb402890a"),
//     credit: 2,
//     expire: new Date("2123-05-16T17:21:46.213Z"),
//     createdAt: new Date("2023-05-16T17:21:46.216Z"),
//     product: [null],
//     currentSubs: 1684254630,
//   },
// ];
const FreeRealSubs = async ({
  email,
  userId,
  credit = 1,
  type = "monthly",
  visitors = 5000,
}) => {
  try {
    if (!email && !userId) throw new Error(`Provide email or user id`);
    const userQry = {};
    if (email) userQry.email = email;
    if (userId) userQry._id = userId;
    const user = await User.findOne(userQry).select("-password").exec();
    if (!user) {
      throw new Error(`User doen't exist following email or userId`);
    }
    const { _id, displayName, email: mail } = user._doc;
    let subsPeriod = moment().valueOf();
    if (type === "monthly") {
      subsPeriod = moment().add(1, "month").valueOf();
    } else if (type === "yearly") {
      subsPeriod = moment().add(1, "year").valueOf();
    } else if (type === "lifetime") {
      subsPeriod = moment().add(100, "year").valueOf();
    }
    const paymentObj = {
      userId: _id,
      subscription: "free_fjskjfksajfsajfksdj",
      amount: 1,
      currency: "usd",
      email: mail,
      name: displayName,
      invoice: "free_kfjsfjsfjsk",
      payment_status: "free",
      payment_method_types: "free",
      status: "active",
      current_period_start: moment().valueOf(),
      current_period_end: subsPeriod,
      quantity: 1,
      customer: "free",
    };
    const plan = await Plan.findOne({ type }).select("visitors").exec();
    const subsObj = {
      userId: _id,
      type,
      planId: plan?.id,// || Types.ObjectId()
      // lifetimeId,
      credit,
      price: 0,
      expire: subsPeriod,
      visitors,
    };
    const newPayment = await Payment.create(paymentObj);
    const newSubs = await Subscription.create(subsObj);
    const paySubsObj = {
      paymentId: newPayment.id,
      subscriptionId: newSubs.id,
    };
    await PaymentSubs.create(paySubsObj);
    return {
      payment: newPayment._doc,
      subscription: newSubs._doc,
      paymentSub: paySubsObj,
    };
  } catch (e) {
    console.log(e);
  }
};
// zawwad124@gmail.com
// FreeRealSubs({ email: "zawwad124@gmail.com", credit: 3, type: 'monthly', visitors: 5000 })
//   .then(console.log)
//   .catch(console.error);
module.exports = {
  mySubscription: async (req, res) => {
    try {
      const { _id, createdAt } = req.user;
      const subscription = await Subscription.aggregate([
        { $match: { userId: Types.ObjectId(_id) } },
        {
          $lookup: {
            from: "plans",
            localField: "planId",
            foreignField: "_id",
            as: "Plan",
          },
        },
        { $unwind: "$Plan" },
        {
          $lookup: {
            from: "payments",
            localField: "userId",
            foreignField: "userId",
            as: "Payment",
          },
        },
        { $unwind: "$Payment" },
        {
          $project: {
            createdAt: 1,
            type: 1,
            credit: 1,
            planId: 1,
            expire: 1,
            product: ["$Plan.prodId"],
            currentSubs: "$Payment.current_period_start",
          },
        },
      ]);

      if (subscription?.length) {
        // let credit = 0,
        //   expire = Date.now(), planId = '';
        // for (const da of subscription) {
        //   credit += da.credit;
        //   if (expire < da.expire) {
        //     expire = da.expire;
        //   }
        //   if (da.type !== 'lifetime') {
        //     planId = da.planId
        //   }
        // }
        return res.json({
          ...subscription[0],
          // credit,
          // expire,
          // planId
        });
      } else {
        const expire =
          ALLOW_TRAIL
            ? new Date(createdAt?.valueOf?.() + 604800000)
            : Date.now() - 86400000;
        const credit = ALLOW_TRAIL ? 1 : 0;
        return res.json({
          expire,
          planId: "",
          product: [],
          customer: "",
          isTrail: true,
          credit,
        });
      }
    } catch (e) {
      let status = e?.status || 500;
      let message = e?.message || `Something Went Wrong`;
      res.status(status).json({
        success: false,
        message,
      });
    }
  },
};
