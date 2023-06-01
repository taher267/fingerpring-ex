const { Schema, model, Types } = require("mongoose");

module.exports = model(
  "LifetimePlan",
  new Schema({
    // credits: { type: Number, required: [true, `Credits is mandatory!`] },
    // visitors: { type: Number, required: [true, `Visitors is mandatory!`] },
    code: {
      type: String,
      required: [true, `Code is mandatory!`],
      select: false,
    },
    isExpired: {
      type: Number,
      default: 0,
      required: [true, `isExpired is mandatory!`],
    },
    planId: {
      type: Types.ObjectId,
      required: true,
      ref: "Plan",
    },
  })
);
