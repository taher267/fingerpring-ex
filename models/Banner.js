const { boolean } = require("joi");
const { model, Schema, Types } = require("mongoose");
module.exports = model(
  "Banner",
  new Schema(
    {
      dealId: { type: Types.ObjectId, required: true, ref: "Deal" },
      locationBannerText: String,
      holidayBannerText: String,
      styling: {
        bannerPosition: {
          type: String,
          enum: ["top", "bottom"],
        },
        fontSize: String,
        fontColor: String,
        borderRadius: String,
        backgroundColor: String,
      },
      closeIcon: { type: Boolean, required: true },
      enabledStyle: { type: Boolean, required: true },
    },
    { timestamps: true }
  )
);
