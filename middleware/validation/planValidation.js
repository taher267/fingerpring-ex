const Joi = require("joi");

// const schema = Joi.object({
//   type: Joi.string().valid("monthly", "yearly", "lifetime").required(),
//   priceId: Joi.string().when("type", {
//     is: "lifetime",
//     then: Joi.string().optional(),
//     otherwise: Joi.string().required(),
//   }),
// }).required();
// const { error } = schema.validate({ type: 'yearly' }, { abortEarly: false });
// console.log(error);

module.exports = {
  createPlanIsValid: async (req, res, next) => {
    try {
      let schema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid("monthly", "yearly", "lifetime").required(),
        visibleType: Joi.string().valid("basic", "lifetime").required(),
        facilities: Joi.array().items(Joi.string().required()).required(),
        price: Joi.number().required(),
        priceId: Joi.string().when("type", {
          is: "lifetime",
          then: Joi.optional(),
        }),
        prodId: Joi.string().when("type", {
          is: "lifetime",
          then: Joi.string().optional(),
          otherwise: Joi.string().required(),
        }),
        credit: Joi.number().required(),
      });
      // korixey367@tingn.com
      let { error } = schema.validate(req.body, { abortEarly: false });
      if (!error) return next();
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
};
