const { Schema, model, Types } = require("mongoose");

module.exports = model(
  "Subscription",
  new Schema(
    {
      type: {
        enum: ["monthly", "yearly", "lifetime"],
        type: String,
        required: true,
      },
      userId: {
        type: Types.ObjectId,
        required: true,
        ref: "User",
      },
      planId: {
        type: Types.ObjectId,
        required: true,
        ref: "Plan",
      },
      lifetimeId: {
        type: Types.ObjectId,
        ref: "LifetimePlan",
      },
      credit: { type: Number, default: 1 },
      price: {
        type: Number,
        required: true,
      },
      expire: {
        type: Date,
        required: true,
      },
      visitors: { type: Number, required: true },
    },
    { timestamps: true }
  )
);
