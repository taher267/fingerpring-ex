const { model, Schema } = require('mongoose');
module.exports = model(
  'DealTypes',
  new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
  })
);
