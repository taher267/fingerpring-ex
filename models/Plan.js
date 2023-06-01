const { Schema, model, Types } = require("mongoose");

module.exports = model(
  "Plan",
  new Schema({
    name: {
      type: String,
      required: true,
    },
    type: {
      enum: ["monthly", "yearly", "lifetime"],
      type: String,
      required: true,
    },
    visibleType: {
      enum: ["basic", "lifetime"],
      type: String,
      required: true,
      default: "basic",
    },
    facilities: [
      {
        type: String,
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    priceId: {
      type: String,
      // required: true,
      // unique: true,
    },
    prodId: {
      type: String,
      // required: true,
      // unique: true,
    },
    credit: { type: Number, default: 0, required: true },
    visitors: { type: Number, required: true }
  })
);
