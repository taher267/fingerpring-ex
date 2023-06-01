// ALL Requires
const jwt = require("jsonwebtoken");
const User = require("../models/User");
// const LoggedinUser = require('../models/LoggedinUser');
const { hash, genSalt, compare } = require("bcrypt");
const crypto = require("crypto");
const { auth } = require("../config/firebaseAdminConfig");
const sendEmail = require("../utils/sendEmail");
const { stripe } = require("../utils/stripe");
const OTPTemp = require("../utils/emailTempaltes/OTPTemp");
// User.find().then(console.log).catch(console.error);
// const moment = require('moment');
// Twitter SignIn + Authorization Controller
// const func : async () => {
//   let email = `abutaher267@gmail.com`;
//   let OTP = `823052`;
//   let displayName = `Taher Abu`;
//   const mailSend = await sendEmail(
//     email,
//     'Verification code from ParityBox',
//     OTPTemp(OTP, displayName.split(' ')?.[0])
//   );
//   console.log(mailSend);
// };
const otpHash = (OTP) =>
  crypto.createHash("sha256").update(OTP?.toString()).digest("hex");
const generateOTP = () => {
  // Generating OTP for Client
  const OTP = crypto.randomInt(100000, 999999);
  //Generate OTP for server
  const OTPToken = crypto
    .createHash("sha256")
    .update(OTP.toString())
    .digest("hex");
  //OTP Expiry
  const OTPExpiry = Date.now() + 15 * 60 * 1000;
  return {
    OTPToken,
    OTP,
    OTPExpiry,
  };
};

module.exports = {
  emailPasswordRegister: async (req, res) => {
    try {
      const { uid, email, displayName, password } = req.body;

      //check user by uid and email
      const existUser = await User.findOne({
        $or: [{ user_email: email }, { uid }],
      });

      //exist message for existing user
      if (existUser) {
        return res.status(400).json({
          message: `User already exist!`,
        });
      }
      const hashPass = await hash(password, await genSalt(10));
      // User Data For Database
      const userData = {
        user_email: email,
        displayName,
        uid,
        userExportCredit: 5,
        password: hashPass,
        // endDate: end_date,
        // planID: 0,
      };

      // Insert User to USER MODEL
      const user = new User(userData);
      await user.save();

      // create jwt token
      const tokenData = {
        email,
        uid,
        _id: user?.id || user?._id?.toString?.() || user?._doc?._id,
      };

      var token = jwt.sign(tokenData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE, // expires in 365 day
      });

      res.json({
        user: userData,
        token: token,
      });
    } catch (e) {
      res.sendStatus(500);
    }
  },

  veriryOTPAndUpdateUser: async (req, res) => {
    try {
      const { uid, email, OTP } = req.body;

      if (!uid || !email || !OTP) {
        return res.sendStatus(400);
      }
      //check user by uid and OTP
      const OTPToken = otpHash(OTP);
      const findUser = await User.findOne({
        $and: [{ user_email: email }, { OTP: OTPToken }, { $gt: Date.now() }],
      });

      if (!findUser) {
        const again = await User.findOne({
          $and: [{ user_email: email }, { OTP: OTPToken }, { $lt: Date.now() }],
        });
        if (again) {
          await User.findOneAndUpdate(
            { user_email: email },
            {
              OTP: "",
              OTPExpiry: Date.now() - 3600,
            },
            { upsert: true }
          );
        }
      }

      if (!findUser) {
        return res.status(400).json({
          message: `invalid or expiried OTP`,
        });
      }
      let trial = (new Date().valueOf() + 604800000) / 1000; //7 day
      // const end_date = new Date(trial).toISOString().split('T')[0];
      const updateData = {
        uid,
        status: "Active",
        OTP: "",
        OTPExpiry: null,
        endDate: Math.trunc(trial),
        planID: 0, // 0 means trial :)
        userExportCredit: 5,
      };
      const updateUser = await User.findOneAndUpdate({ email }, updateData, {
        new: true,
      });
      const userData = { ...findUser._doc, ...updateData };
      let subscription = {
        credit: 1,
        expire: new Date(userData.createdAt?.valueOf?.() + 604800000),
        planId: "",
        product: [],
        customer: "",
        isTrail: true,
      };
      delete userData.password;
      delete userData.OTP;
      delete userData.OTPExpiry;
      delete userData.createdAt;
      delete userData.updatedAt;
      delete userData.__v;

      // create jwt token
      const tokenData = { email, uid: uid, _id: userData._id };
      const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE, // expires in 365 day
      });
      let stripe = { havePlan: false };

      res.json({
        subscription,
        user: userData,
        token: token,
      });
    } catch (e) {
      res.sendStatus(500);
    }
  },

  isExistOTPUser: async (req, res) => {
    try {
      const { email, OTP } = req.body;

      if (!email || !OTP) {
        return res.sendStatus(400);
      }

      //check user by email and OTP
      const OTPToken = otpHash(OTP);
      const user = await User.findOne({
        $and: [{ user_email: email }, { OTP: OTPToken }, { $gt: Date.now() }],
      });
      if (!user) {
        return res.status(400).json({
          message: `Invalid or expired OTP`,
        });
      }
      res.sendStatus(202);
    } catch (err) {
      res.sendStatus(500);
    }
  },
  // emailPasswordRegisterWithOTP: (req, res) => res.sendStatus(400),
  emailPasswordRegisterWithOTP: async (req, res) => {
    try {
      const { email, displayName, password } = req.body;
      //check user by uid and email
      const existUser = await User.findOne({
        email,
      }).exec();
      //exist message for existing user
      if (existUser) {
        return res.status(400).json({
          message: `User already exist!`,
        });
      }
      // 25,200,000 7 Days

      // User Data For Database
      const { OTPToken, OTP, OTPExpiry } = generateOTP();
      const hashPass = await hash(password, await genSalt(10));
      const userData = {
        OTPExpiry,
        OTP: OTPToken,
        email,
        displayName,
        password: hashPass,
      };
      const created = await User.create(userData);
      // console.log(created);
      newUser = created?.id;
      const mailSend = await sendEmail(
        email,
        "Verification code from ParityBox",
        OTPTemp(OTP, displayName.split(" ")?.[0])
      );
      if (!mailSend?.accepted) {
        return res.sendStatus(400);
      }
      res.send({
        otp: true,
        email,
      });
    } catch (e) {
      console.log(e);
      if (newUser) await User.findOneAndDelete(newUser);
      const status = e?.status || 500;
      res.status(status).json({ message: e?.message });
    }
  },

  emailPasswordLogin: async (req, res) => {
    try {
      const { uid, email, password } = req.body;

      const existUser = await User.aggregate([
        {
          $match: {
            uid,
            email,
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id", //user
            foreignField: "userId", //subscriptions
            as: "Subs",
          },
        },
        // { $unwind: '$Subs' },
        {
          $lookup: {
            from: "paymentsubs",
            localField: "Subs._id", // Subscription
            foreignField: "subscriptionId",
            as: "PaySubs",
          },
        },

        {
          $lookup: {
            from: "payments",
            localField: "PaySubs.paymentId",
            foreignField: "_id",
            as: "Payment",
          },
        },
        {
          $lookup: {
            from: "stripeconnects",
            foreignField: "userId",
            localField: "_id",
            as: "StripeConnets",
          },
        },
        {
          $project: {
            _id: 1,
            email: 1,
            status: 1,
            displayName: 1,
            uid: 1,
            StripeConnets: 1,
            createdAt: 1,
            credit: "$Subs.credit",
            expire: "$Subs.expire",
            planId: "$Subs.planId",
            product: "$Payment.product",
            customer: "$Payment.customer",
            paymentCreatedAt: "$Payment.createdAt",
            currentSubs: "$Payment.current_period_start",
          },
        },
      ]);
      //exist message for existing user
      if (!existUser?.length) {
        return res.status(400).json({
          message: `Credentials doesn't match!`,
        });
      }

      // const dbPass = existUser.password;
      // if (!dbPass) {
      //   return res.status(400).json({
      //     message: `Credentials doesn't match!`,
      //   });
      // }
      // const hashPass = await compare(password, dbPass);
      // if (!hashPass) {
      //   return res.status(400).json({
      //     message: `Credentials doesn't match!`,
      //   });
      // }
      // User Data For Database

      let {
        credit,
        expire,
        planId,
        product,
        customer,
        currentSubs,
        createdAt,
        StripeConnets,
        ...user
      } = existUser?.[0];

      let subs = { product, isTrail: expire?.[0] ? false : true, currentSubs };
      let trail7Days = new Date(createdAt?.valueOf?.() + 604800000);
      subs.credit = Array.isArray(credit) ? credit[0] : 1;
      subs.expire = Array.isArray(expire)
        ? (expire?.length && expire?.[0]) || trail7Days
        : trail7Days;
      subs.planId = Array.isArray(planId) ? planId[0] : "";
      subs.customer = Array.isArray(customer) ? customer[0] : "";
      // create jwt token
      const tokenData = {
        email,
        uid,
        _id: user._id,
      };
      const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE, // expires in 365 day
      });
      res.json({
        subscription: subs,
        stripeConnets: StripeConnets?.length,
        user,
        token: token,
      });
    } catch (e) {
      res.sendStatus(500);
    }
  },
};
