const { Schema, model, Types } = require("mongoose");

module.exports = model(
  "Visitor",
  new Schema({
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    dealId: {
      type: Types.ObjectId,
      required: true,
      ref: "Deal",
    },
    diviceInfo: String,
    createdAt: { type: Date, default: Date.now },
  })
);
