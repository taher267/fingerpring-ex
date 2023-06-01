const { isValidObjectId } = require("mongoose");
const Plan = require("../models/Plan");
// const { randomBytes } = require("crypto");

// Plan.create({
//   name: "Basic",
//   type: "lifetime",
//   visibleType: "lifetime",
//   facilities: [
//     "Upto 10k page visits/month",
//     "VPN Protection",
//     "Remove Branding",
//     "API Sevice",
//   ],
//   price: 24.99,
//   // priceId: `price_1N8PwaCTS79xu5AHFN8FZgEN`,
//   // prodId: `prod_NuEPeRhHR7hlRM`,
//   credit: 2,
//   visitors: 100000,
// })
//   .then((d) => console.log(d))
//   .catch((d) => console.log(d));

module.exports = {
  getAllPlans: async (req, res) => {
    try {
      const { types = "basic" } = req.query;
      const plans = await Plan.find({
        visibleType: { $in: types?.split?.(",") },
      });
      res.json({ success: true, plans });
    } catch (e) {
      let status = e?.status || 500;
      let message = e?.message || `Something Went Wrong`;
      res.status(status).json({
        success: false,
        message,
      });
    }
  },

  createPlan: async (req, res) => {
    try {
      const plan = new Plan(req.body);
      await plan.save();
      res.status(201).json({ success: true, plan });
    } catch (e) {
      let status = e?.status || 500;
      let message = e?.message || `Something Went Wrong`;
      res.status(status).json({
        success: false,
        message,
      });
    }
  },
};
