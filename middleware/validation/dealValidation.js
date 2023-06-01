const Joi = require("joi");
const { isValidObjectId } = require("mongoose");
const Deal = require("../../models/Deal");
const createCouponAndPromo = require("../../helpers/strie-connect/createCouponAndPromo");
const styling = Joi.object({
  bannerPosition: Joi.string().valid("top", "bottom"),
  fontSize: Joi.string(),
  fontColor: Joi.string(),
  borderRadius: Joi.string().allow(""),
  backgroundColor: Joi.string(),
});
const commonSchema = {
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  url: Joi.string().uri().required(),
  location_deal: Joi.boolean(),
  locations: Joi.array().when("location_deal", {
    is: true,
    then: Joi.array()
      .items(
        Joi.object({
          voucher: Joi.string().allow(""),
          percentage: Joi.string().allow(),
          locationTypeDealGroup: Joi.number().required(),
        }).required()
      )
      .required(),
    otherwise: Joi.optional(),
  }),
  locationBannerText: Joi.string().when("location_deal", {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  locationTexts: Joi.object().when("location_deal", {
    is: true,
    then: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
    otherwise: Joi.optional(),
  }),
  holiday_deal: Joi.boolean(),
  holidays: Joi.array().when("holiday_deal", {
    is: true,
    then: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().required(),
          day: Joi.string().required(),
          startBefore: Joi.string().allow(""),
          endAfter: Joi.string().allow(""),
          voucher: Joi.string().allow(""),
          percentage: Joi.string().allow(""),
        }).required()
      )
      .required(),
    otherwise: Joi.optional(),
  }),
  holidayTexts: Joi.object().when("holiday_deal", {
    is: true,
    then: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
    otherwise: Joi.optional(),
  }),
  holidayBannerText: Joi.string().when("locationBannerText", {
    is: null,
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  routes: Joi.array(),
  styling,
  closeIcon: Joi.bool().default(false),
  enabledStyle: Joi.bool().default(true),
};
const updateSchema = {
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  url: Joi.string().uri().required(),
  dealTypeIds: Joi.object({
    location: Joi.string(),
    holiday: Joi.string(),
  }).required(),
  location_deal: Joi.boolean(),
  locations: Joi.array().when("location_deal", {
    is: true,
    then: Joi.array()
      .items(
        Joi.object({
          voucher: Joi.string().allow(""),
          percentage: Joi.string().allow(""),
          _id: Joi.string(),
          locationTypeDealGroup: Joi.number(),
        }).required()
      )
      .required(),
    otherwise: Joi.optional(),
  }),
  locationTexts: Joi.object().when("location_deal", {
    is: true,
    then: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
    otherwise: Joi.optional(),
  }),
  locationBannerText: Joi.string().when("holiday_deal", {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  holiday_deal: Joi.boolean(),
  holidays: Joi.array().when("holiday_deal", {
    is: true,
    then: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().required(),
          day: Joi.string().required(),
          startBefore: Joi.string().allow(""),
          endAfter: Joi.string().allow(""),
          voucher: Joi.string().allow(""),
          _id: Joi.string(),
          percentage: Joi.string().allow(""),
        }).required()
      )
      .required(),
    otherwise: Joi.optional(),
  }),
  holidayTexts: Joi.object().when("holiday_deal", {
    is: true,
    then: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
    otherwise: Joi.optional(),
  }),
  holidayBannerText: Joi.string().when("locationBannerText", {
    is: null,
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  // bannerId: Joi.string().required(),
  closeIcon: Joi.bool().default(false),
  enabledStyle: Joi.bool().default(true),
  styling,
  routes: Joi.array(),
};

module.exports = {
  createDealIsValid: async (req, res, next) => {
    try {
      const { _id, credit = 1 } = req.user;
      if (!isValidObjectId(_id)) return res.sendStatus(500);
      const dealsCount = await Deal.countDocuments({ userId: _id }).exec();
      if (1 > credit - dealsCount)
        return res.status(400).json({
          success: false,
          message: `Insufficient credit, Please delete one deal!`,
        });
      let schema = Joi.object(commonSchema);

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
      console.log(e);
      const status = e?.status || 500;
      const message = e?.message || `Something Went Wrong!`;
      return res.status(status).json({
        success: false,
        message,
      });
    }
  },
  createStripeDealIsValid: async (req, res, next) => {
    try {
      const { _id, credit = 1 } = req.user;
      if (!isValidObjectId(_id)) return res.sendStatus(500);
      const dealsCount = await Deal.countDocuments({ userId: _id }).exec();
      if (1 > credit - dealsCount)
        return res.status(400).json({
          success: false,
          message: `Insufficient credit, Please delete one deal!`,
        });
      let schema = Joi.object({
        productIds: Joi.array().items(Joi.string().required()).required(),
        connect: Joi.string().required(),
        ...commonSchema,
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
      console.log(e);
      const status = e?.status || 500;
      const message = e?.message || `Something Went Wrong!`;
      return res.status(status).json({
        success: false,
        message,
      });
    }
  },
  updateDealIsValid: async (req, res, next) => {
    try {
      const { dealId } = req.params;
      if (!isValidObjectId(dealId)) {
        return res.status(400).json({
          success: false,
          errors: { common: `Something Went Wrong!` },
        });
      }
      // console.log(req.body);
      const schema = Joi.object(updateSchema).required();
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
      console.log(e);
      const status = e?.status || 500;
      const message = e?.message || `Something Went Wrong!`;
      return res.status(status).json({
        success: false,
        message,
      });
    }
  },
  updateSteipeDealIsValid: async (req, res, next) => {
    try {
      const { dealId } = req.params;
      if (!isValidObjectId(dealId)) {
        return res.status(400).json({
          success: false,
          errors: { common: `Something Went Wrong!` },
        });
      }
      // console.log(req.body);
      const schema = Joi.object({
        ...updateSchema,
        stripeAccount: Joi.string().required(),
      }).required();
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
      console.log(e);
      const status = e?.status || 500;
      const message = e?.message || `Something Went Wrong!`;
      return res.status(status).json({
        success: false,
        message,
      });
    }
  },
};
