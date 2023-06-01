const { model, Schema, Types } = require('mongoose');
module.exports = model(
  'LocationTypeDeal',
  new Schema({
    dealTypeId: { type: Types.ObjectId, required: true, ref: 'DealTypes' },
    locationTypeDealGroup: { type: Number, required: true },
    voucher: { type: String },
    percentage: { type: Number },
    couponId: String,
    promoId: String,
  })
);
