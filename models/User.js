// USER MODEL REQUIRES
const { Schema, model } = require('mongoose');

module.exports = model(
  'User',
  new Schema(
    {
      email: {
        type: String,
        required: true,
      },
      displayName: {
        type: String,
        required: true,
      },
      uid: String, //from ffrirebase
      profileIMG: {
        type: String,
      },
      status: {
        type: String,
        default: 'Pending',
      },
      password: String,
      OTP: String,
      OTPExpiry: Date,
      // leftCredit: { type: Number, default: 1 }, //subs
    },
    {
      timestamps: true,
    }
  )
);
