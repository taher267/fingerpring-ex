const { isValidObjectId, Types } = require("mongoose");
const stripe = require("../utils/stripe");
const leadforestLive = require("stripe")(
  "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"
);
const { randomBytes } = require("crypto");
const StripeConnect = require("../models/StripeConnect");
const User = require("../models/User");
const productsArrsMap = require("../helpers/strie-connect/productsArrsMap");
const Deal = require("../models/Deal");
const { ALLOW_TRAIL } = require("../config");
const moment = require("moment");
// console.log();

const stripeAccount = "acct_1Mg6b1JiucP6ZDzJ";
const stripeAccountTweetsy = "acct_1M0QGtCx996FZZga";
const couponPromoDeal = [
  {
    id: "fskfdjfs", // coupon
    code: "jfksdjfs",
  },
];

async function paymentLinks() {
  try {
    const stripeAccount = "acct_1M0QGtCx996FZZga";
    const proms = await stripe.paymentLinks.list({
      stripeAccount,
    });
    console.log(proms.data[0]);
    for await (const item of proms?.data || []) {
      console.log(item.id);
      // if (item.metadata?.dealTypeId === '647388e2c1b0096386bd76d5') {
      //   const updated = await stripe.promotionCodes.update(
      //     item.id,
      //     {
      //       active: false,
      //       metadata: {},
      //     },
      //     {
      //       stripeAccount,
      //     }
      //   );
      //   console.log(updated)
      // }
    }
  } catch (e) {
    console.log(e.message);
  }
}

const updatePaymentLinks = async (stripeAccount) => {
  try {
    if (!stripeAccount) {
      console.log(`Please provide stripeAccount`);
      return false;
    }
    const links = await stripe.paymentLinks.list({
      stripeAccount,
    });
    const env = process.env.NODE_ENV === "production";
    for await (const item of links?.data || []) {
      console.log(item.allow_promotion_codes);
      if (item.active && item.livemode === env && !item.allow_promotion_codes) {
        const updated = await stripe.paymentLinks.update(
          item.id,
          {
            allow_promotion_codes: true,
          },
          {
            stripeAccount,
          }
        );
        // console.log(updated);
      }
    }
  } catch (e) {
    console.log(e.message);
  }
};
// updatePaymentLinks(stripeAccountTweetsy);
// stripe.coupons.list({ limit: 1000 }, { stripeAccount }).then(d => console.log(d.data)).catch(console.error);

async function PromoCodeList() {
  try {
    const stripeAccount = "acct_1M0QGtCx996FZZga";
    const proms = await stripe.promotionCodes.list({
      stripeAccount,
    });
    // console.log(proms.data?.length);
    for await (const item of proms?.data || []) {
      console.log(item);
      // if (item.metadata?.dealTypeId === '647388e2c1b0096386bd76d5') {
      //   const updated = await stripe.promotionCodes.update(
      //     item.id,
      //     {
      //       active: false,
      //       metadata: {},
      //     },
      //     {
      //       stripeAccount,
      //     }
      //   );
      //   console.log(updated)
      // }
    }
  } catch (e) {
    console.log(e.message);
  }
}
// PromoCodeList();

async function delCoupons() {
  try {
    const stripeAccount = "acct_1M0QGtCx996FZZga";
    const coupons = await stripe.coupons.list({
      stripeAccount,
    });
    for await (const item of coupons?.data || []) {
      // const del = await stripe.coupons.del(item.id, {
      //   stripeAccount,
      // });
      // console.log(del);
      console.log(item.metadata);
    }
  } catch (e) {
    console.log(e.message);
  }
}
// delCoupons();
async function STT() {
  try {
    const stripeAccount = "acct_1M0QGtCx996FZZga";
    const cpn = `5X3bfIYo`;
    // const data = await stripe.coupons.retrieve('CQ4sw0iL',
    //   // {
    //   //   name: coupon,
    //   //   percent_off: 25.5,
    //   //   duration: "forever",
    //   //   applies_to: { products: ["prod_Nw1PP91XoyoZH8"] },
    //   // },
    //   {
    //     stripeAccount,
    //   }
    // );
    // console.log(data)
    // const promotionCode = await stripe.promotionCodes.list(
    //   // 'promo_1NBbsDCx996FZZgat2sCuSen',
    //   // {
    //   //   coupon: data.id,
    //   //   code: "code21",
    //   //   metadata: { one: "five" },
    //   // },
    //   {
    //     stripeAccount,
    //   }
    // );

    const promotionCode = await stripe.promotionCodes.create(
      {
        coupon: cpn,
        code: "DKL6NIKR",
        metadata: { one: "five" },
      },
      {
        stripeAccount,
      }
    );
    console.log(promotionCode);
    // console.log(promotionCode.data?.map?.(({ id }) => id));
  } catch (e) {
    // console.log(e);
    console.log(e.message);
  }
}
// STT();

const userStripeConnections = async (_id, params = {}) =>
  User.aggregate([
    {
      $match: { _id: Types.ObjectId(_id) },
    },
    {
      $lookup: {
        from: "stripeconnects",
        foreignField: "userId",
        localField: "_id",
        as: "connects",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        foreignField: "userId",
        localField: "_id",
        as: "subs",
      },
    },
    {
      $lookup: {
        from: "deals",
        foreignField: "userId",
        localField: "_id",
        as: "dls",
      },
    },
    // { $unwind: '$Subscription' },
    {
      $project: {
        // _id: 1,
        createdAt: 1,
        connects: 1,
        subs: 1,
        dls: 1,
      },
    },
  ]); // 6463ab1b6cf0233d6899080e  //64744a9e1fdaf83e874522f3
/**
 *
 * @param {connects, subs, dls, createdAt } data
 * @returns {credit haveExpiry expire visitors totalConnected totalDeals}
 */
const userAccessibilities = (data = {}) => {
  const { connects, subs, dls, createdAt } = data;

  let credit = 0,
    expire = Date.now() - 3600,
    visitors = 0,
    totalConnected = connects?.length,
    totalDeals = dls?.length;
  for (const subc of subs || []) {
    if (subc.credit) credit += subc.credit;
    if (subc.visitors) visitors += subc.visitors;
    if (subc.expire > expire) expire = subc.expire;
  }
  if (ALLOW_TRAIL)
    expire = moment(createdAt).add(7, "day").utc();
  if (!credit && expire > Date.now() && ALLOW_TRAIL) credit = 1;

  return {
    credit,
    haveExpiry: expire > Date.now(),
    expire,
    visitors,
    totalConnected,
    totalDeals,
  };
};

// userStripeConnections("645cb11c386c6aaba297edd4")
//   .then((d) => {
//     const data = d[0];
//     if (!data?._id) {
//       //redirect
//     }
//     console.log(userAccessibilities(data));
//   })
//   .catch(console.error);

const createNewStripeConnection = async (
  stripeAccount,
  newStripeConnect = {}
) => {
  try {
    const newObj = JSON.parse(JSON.stringify(newStripeConnect));
    const {
      settings: {
        dashboard: { display_name },
      },
    } = await stripe.account.retrieve(stripeAccount);
    newObj.stripeAccountName = display_name;
    return await StripeConnect.create(newObj);
  } catch (e) {
    const err = new Error(e.message);
    err.status = e.status || e.statusCode;
  }
};

const allCoupons = async (stripeAccount) => {
  try {
    const coupons = await stripe.coupons.list({
      stripeAccount,
    });
    const results = coupons.data?.reduce?.((a, c) => {
      const { duration, percent_off, name, valid, metadata } = c;
      if (
        duration === "forever" &&
        valid &&
        name?.startsWith?.("PB") &&
        metadata?.dealTypeId
      ) {
        if (!a[percent_off]) a[percent_off] = c;
      }
      return a;
    }, {});
    return results;
  } catch (e) {
    return { error: true, message: e.message };
  }
};
module.exports = {
  /**
   * 1. direct from stripe connect  with code and state
   * 2. check is present _id(userid) and url (frontend) from state and code (from pr0ovide stripe)
   * 3. stripe auth by code, it is return {stripe_user_id}
   * 4.
   * @returns
   */
  stripeAuth: async (req, res) => {
    const route = `stripe-deal/?type=stripe&`;
    const orgn = process.env.NODE_ENV === "development" ? `http://localhost:3000` : `https://dev-parityboss.netlify.app`;
    const redirectUrl = `${orgn}/${route}`;
    try {
      const { code, state = "" } = req.query;
      let [_id = "", url = ""] = state?.split?.(" ");
      if (!_id?.length || !url?.length || !code) {
        url = `${redirectUrl}stripe_con_err=true`;
        return res.redirect(url);
      } else if (!_id || !isValidObjectId(_id)) {
        url = `${redirectUrl}user_mismatch=true`;
        return res.redirect(url);
      }
      const doesExistUser = await userStripeConnections(_id);
      if (!doesExistUser?.[0]?._id) {
        return res.redirect(`${redirectUrl}invalid_user=true`);
      }
      const {
        credit,
        haveExpiry,
        expire,
        visitors,
        totalConnected,
        totalDeals,
      } = userAccessibilities(doesExistUser?.[0]);
      if (!haveExpiry) {
        return res.redirect(
          `${orgn}/${subscription}/?type=stripe&expiresubs=true`
        );
      }
      if (credit <= totalDeals) {
        return res.redirect(`${redirectUrl}limitExtend=true`);
      }
      if (credit <= totalConnected) {
        return res.redirect(`${redirectUrl}stripeConnectLimit=true`);
      }

      const authorize = await stripe.oauth.token({
        grant_type: "authorization_code",
        code,
      });

      const { stripe_user_id: stripeAccount, ...rest } = authorize;
      const newStripeConnect = {
        stripeAccount,
        userId: _id,
        ...rest,
      };

      const connected = await StripeConnect.findOne({ stripeAccount }).exec();
      if (connected) {
        return res.redirect(`${redirectUrl}already_connect=true`);
      }
      const saved = await createNewStripeConnection(
        stripeAccount,
        newStripeConnect
      );
      return res.redirect(`${redirectUrl}newcon=${saved.id || saved._doc._id}`);
      // stripe.products.list({
      //   stripeAccount,
      // });

      // res.redirect(url);
    } catch (e) {
      const status = e.status || e.statusCode || 500;
      const message = e.message;
      console.log(e.message);
      res.redirect(`${redirectUrl}server=${status}&message=${message}`);
      // res.status(status);
      // res.json({ message });
    }
  },

  stripeAuthPrev: async (req, res) => {
    const redirectUrl = (url =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/stripe-deal/?type=stripe&"
        : "https://dev-parityboss.netlify.app/stripe-deal/?type=stripe&");
    try {
      const { code, state = "" } = req.query;
      let [_id = "", url = ""] = state?.split?.(" ");
      if (!_id?.length || !url?.length || !code) {
        url = `${redirectUrl}stripe_con_err=true`;
        return res.redirect(url);
      } else if (!_id || !isValidObjectId(_id)) {
        url = `${redirectUrl}user_mismatch=true`;
        return res.redirect(url);
      }
      const doesExistUser = await userStripeConnections(_id);
      if (!doesExistUser?.length) {
        return res.redirect(`${redirectUrl}invalid_user=true`);
      }
      const authorize = await stripe.oauth.token({
        grant_type: "authorization_code",
        code,
      });

      const { stripe_user_id: stripeAccount, ...rest } = authorize;
      const newStripeConnect = {
        stripeAccount,
        userId: _id,
        ...rest,
      };
      // if (!doesExistUser?.StripeConnect?.length) {
      //   const saved = await createNewStripeConnection(
      //     stripeAccount,
      //     newStripeConnect
      //   );
      //   return res.redirect(
      //     `${redirectUrl}newcon=${saved.id || saved._doc._id}`
      //   );
      // }
      const stripeAccounIDs = doesExistUser?.[0]?.StripeConnect.map(
        (item) => item.stripeAccount
      );
      if (stripeAccounIDs.includes(stripeAccount)) {
        return res.redirect(`${redirectUrl}already_connect=true`);
      }
      const saved = await createNewStripeConnection(
        stripeAccount,
        newStripeConnect
      );
      return res.redirect(`${redirectUrl}newcon=${saved.id || saved._doc._id}`);
      // stripe.products.list({
      //   stripeAccount,
      // });

      // res.redirect(url);
    } catch (e) {
      const status = e.status || e.statusCode || 500;
      const message = e.message;
      console.log(e.message);
      res.redirect(`${redirectUrl}server=${status}&message=${message}`);
      // res.status(status);
      // res.json({ message });
    }
  },
  stripeProducts: async (req, res) => {
    try {
      const { _id } = req.user;
      let { sa_id = "" } = req.query;
      if (!sa_id) {
        const search = await StripeConnect.findOne({ userId: _id });
        if (!search) return res.json({ message: `There is no connection!` });
        sa_id = search._doc.stripeAccount;
      }
      const { data } = await stripe.products.list({
        stripeAccount: sa_id,
      });
      const products = productsArrsMap(data, [
        "name",
        "id",
        "images",
        "default_price",
        "description",
      ]);
      res.json({ products, sa_id });
    } catch (e) {
      const status = e.status || e.statusCode || 500;
      const message = e.message;
      console.log(e.message);
      res.status(status);
      res.json({ message });
    }
  },
  stripeConnectedAccounts: async (req, res) => {
    try {
      const { _id } = req.user;
      const connectedAccounts = await StripeConnect.find({
        userId: _id,
      })
        .select("stripeAccount stripeAccountName isUsed -_id")
        .exec();
      res.json({ connectedAccounts });
    } catch (e) {
      const status = e.status || e.statusCode || 500;
      const message = e.message;
      console.log(e.message);
      res.status(status);
      res.json({ message });
    }
  },
  countStripeconnect: async (req, res) => {
    try {
      const { _id } = req.user;
      const count = await StripeConnect.countDocuments({ userId: _id }).exec();
      const dealsCount = await Deal.countDocuments({ userId: _id }).exec();
      res.json({ count, dealsCount });
    } catch (e) {
      const status = e.status || e.statusCode || 500;
      const message = e.message;
      console.log(e.message);
      res.status(status);
      res.json({ message });
    }
  },
  extra: async (req, res) => {
    try {
    } catch (e) {
      const status = e.status || e.statusCode || 500;
      const message = e.message;
      console.log(e.message);
      res.status(status);
      res.json({ message });
    }
  },
  allCoupons,
  updatePaymentLinks,
};
