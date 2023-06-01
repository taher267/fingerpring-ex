const Joi = require("joi");

module.exports = {
  createLTPlanIsValid: async (req, res, next) => {
    try {
      let schema = Joi.object({
        // credit: Joi.number().required(),
        // visitors: Joi.number().required(),
        planId: Joi.string()
          .pattern(/^[a-f\d]{24}$/i)
          .required(),
        generateNoOfCode: Joi.number().required(),
      });
      let { error, value } = schema.validate(req.body, { abortEarly: false });
      if (!error) {
        req.joiBody = value;
        return next();
      }
      const errors = error.details?.reduce(
        (a, { message, context: { key, limit }, type }) => ({
          ...a,
          [key]: message,
        }),
        {}
      );
      return res.status(400).json({ errors });
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
};
