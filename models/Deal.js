const { model, Schema, Types } = require("mongoose");
module.exports = model(
  "Deal",
  new Schema(
    {
      name: { type: String, required: true },
      userId: { type: Types.ObjectId, required: true, ref: "User" },
      description: String,
      // locationTypeId: { type: Types.ObjectId, ref: 'DealTypes' },
      // holidayTypeId: { type: Types.ObjectId, ref: 'DealTypes' },
      dealTypeIds: {
        location: { type: Types.ObjectId, ref: "DealTypes" },
        holiday: { type: Types.ObjectId, ref: "DealTypes" },
      },
      // dealTypeIds: [{ type: Types.ObjectId, required: true }],
      url: { type: String, required: true, unique: true },
      routes: Array,
      stripeAccount: { type: String },
      products: [String],


    },
    { timestamps: true }
  )
);
