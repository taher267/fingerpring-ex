const moment = require("moment");
const { ALLOW_TRAIL } = require("../config");
const Subscription = require("../models/Subscription");
module.exports = async (req, res, next) => {
  try {
    const { _id, createdAt } = req.user;
    const subscription = await Subscription.findOne({ userId: _id })
      .select("expire credit type planId")
      .exec();
    if (
      !subscription &&
      ALLOW_TRAIL === true &&
      createdAt?.valueOf?.() + 604800000 > Date.now()
    ) {
      return next();
    } else if (
      subscription?.expire &&
      subscription?.expire?.valueOf?.() > Date.now()
    ) {
      req.user = {
        ...req.user,
        credit: subscription?.credit || 0,
        // expire: subscription?.expire,
      };
      return next();
    } else {
      let msg = `Trail or Subscription expired!`;
      if (ALLOW_TRAIL !== true) {
        msg = "Please, Subscription!";
      }
      return res.status(402).json({
        message: msg,
      });
    }
  } catch (e) {
    let status = e?.status || 500;
    let message = e?.message || `Something Went Wrong`;
    return res.status(status).json({
      success: false,
      message,
    });
  }
};

const func = async (req, res, next) => {
  try {
    const { _id, createdAt } = req.user;
    const subscription = await Subscription.find({ userId: _id })
      .select("expire credit type planId")
      .exec();
    const expire = subscription
      ?.map?.((item) => item.expire)
      ?.sort?.((a, b) => b - a)?.[0];
    if (
      !subscription?.length &&
      ALLOW_TRAIL === true &&
      moment(createdAt).add(7, "days").valueOf()
    ) {
      return next();
    } else if (expire && moment.isDate(expire) && expire > Date.now()) {
      req.user = {
        ...req.user,
        credit: subscription?.credit || 0,
        // expire: subscription?.expire,
      };
      return next();
    } else {
      let msg = `Trail or Subscription expired!`;
      if (ALLOW_TRAIL !== true) {
        msg = "Please, Subscription!";
      }
      return res.status(402).json({
        message: msg,
      });
    }
  } catch (e) {
    let status = e?.status || 500;
    let message = e?.message || `Something Went Wrong`;
    return res.status(status).json({
      success: false,
      message,
    });
  }
};
