const { model, Schema, Types } = require('mongoose');
module.exports = model(
  'PaymentSubs',
  new Schema({
    paymentId: { type: Types.ObjectId, required: true, ref: 'Payment' },
    subscriptionId: {
      type: Types.ObjectId,
      required: true,
      ref: 'Subscription',
    },
  })
);
