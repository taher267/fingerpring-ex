const { model, Schema, Types } = require("mongoose");
module.exports = model(
  "StripeConnect",
  new Schema({
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    stripeAccount: {
      type: String,
      required: true,
      index: true
    },
    stripeAccountName: { type: String, required: true },
    scope: { type: String, required: true },
    token_type: { type: String, required: true },
    livemode: { type: Boolean, required: true },
    isUsed: { type: Boolean, default: false },
    dealId: { type: Types.ObjectId, ref: "Deal" },
    // access_token: { type: String, required: true },
    // refresh_token: { type: String, required: true },
    // stripe_publishable_key: { type: String, required: true },
    // connectTime: { type: Date, required: true },
  })
);

/**
 * {
  access_token: 'sk_test_51Mg6b1JiucP6ZDzJsmXv6moSmfOxFGyThIU5yOf95Vz2PQzdTfbcEIh8KDsVT2s8UjxqfIOUs4EiN4HkL64NbWht00ZHt7HVzr',       
  livemode: false,
  refresh_token: 'rt_NwdWRo2PcRRymdpyEzYGqBVgiJqIPOJ9bLchCFRJbCNu4LUg',
  token_type: 'bearer',
  stripe_publishable_key: 'pk_test_51Mg6b1JiucP6ZDzJexZvYbIjYROpd8zO2W712kWNzLi7LPxmdSPMqhUr8NL2X61gJbwBO5DYu39EqHhZehNojp5m0090OLvwhk',
  stripe_user_id: 'acct_1Mg6b1JiucP6ZDzJ',
  scope: 'read_write'
}
 */
