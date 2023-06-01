const Joi = require("joi");
const { auth } = require("../../config/firebaseAdminConfig");
const User = require("../../models/User");
const doesExistUserAtFirebase = async (email) => {
  try {
    await auth().getUserByEmail(email);
    return {
      exist: true,
      message: `User already exists!`,
    };
  } catch (e) {
    if (e.errorInfo.code === "auth/user-not-found") {
      return {
        exist: false,
      };
    }
    return {
      exist: true,
      message: e.errorInfo.message || `Something Wont Wrong!`,
    };
  }
};

module.exports = {
  emailPasswordRegisterIsValid: async (req, res, next) => {
    try {
      const { email } = req.body;
      let schema = Joi.object({
        email: Joi.string().email().required(),
        displayName: Joi.string().required(),
        password: Joi.string().min(8).max(32).required(),
      });
      let { error } = schema.validate(req.body, { abortEarly: false });
      if (!error) {
        const firebaseAllow = await doesExistUserAtFirebase(email, res);
        if (firebaseAllow?.exist === false) {
          const existUser = await User.findOne({ email });
          if (existUser) {
            return res.status(400).json({
              success: false,
              message: `User Already exists!`,
              errors: {
                common: `User Already exists!`,
              },
            });
          }
          return next();
        }
        return res.status(400).json({
          message: firebaseAllow.message,
        });
      }

      const errors = error.details?.reduce(
        (a, { message, context: { key, limit }, type }) => ({
          ...a,
          [key]: message,
          // [key]: { message, type, key, limit },
        }),
        {}
      );
      return res.status(400).json({ ...error.details, errors });
    } catch (e) {
      const status = e?.status || 500;
      const message = e?.message || `Something Went Wrong!`;
      return res.status(status).json({
        success: false,
        errors: {
          common: message,
        },
      });
    }
  },
  emailPasswordLoginIsValid: async (req, res, next) => {
    try {
      let schema = Joi.object({
        email: Joi.string().email().required(),
        uid: Joi.string().required(),
        password: Joi.string().required(),
      });

      let { error } = schema.validate(req.body, { abortEarly: false });
      if (!error) return next();
      const errors = error.details?.reduce(
        (a, { message, context: { key, limit }, type }) => ({
          ...a,
          [key]: { message, type, key, limit },
        }),
        {}
      );
      return res.status(400).json({ ...error.details, errors });
    } catch (e) {
      const status = e?.status || 500;
      const message = e?.message || `Something Went Wrong!`;
      return res.status(status).json({
        success: false,
        message,
      });
    }
  },
};
