const { model, Schema, Types } = require("mongoose");
module.exports = model(
  "HolidayTypeDeal",
  new Schema({
    dealTypeId: { type: Types.ObjectId, required: true, ref: "DealTypes" },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    startBefore: { type: Number },
    endAfter: { type: Number },
    voucher: { type: String },
    percentage: { type: Number },
    couponId: String,
    promoId: String,
  })
);
