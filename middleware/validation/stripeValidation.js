const Joi = require('joi');

module.exports = {
  createSessionIsValid: async (req, res, next) => {
    try {
      //   console.log(req.body);
      let schema = Joi.object({
        email: Joi.string().email().required(),
        priceId: Joi.string().required(),
      });
      let { error } = schema.validate(req.body, { abortEarly: false });
      if (!error) return next();
      return res.status(400).json(error.details);
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
