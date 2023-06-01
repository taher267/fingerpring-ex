const router = require("express").Router();
const lifetimePlanController = require("../controllers/lifetimePlanController");
const auth = require("../middleware/auth");
const LifetimePlanValidation = require("../middleware/validation/LifetimePlanValidation");
// All Requires
router
  /**
   * @method POST
   * @route base_url/api/v1/ltplans/subscribe
   */
  .post('/subscribe',
    auth.authentication,
    // LifetimePlanValidation.createLTPlanIsValid,
    lifetimePlanController.lifetimeSubscription
  )
  /**
   * @method POST
   * @route base_url/api/v1/ltplans
   */
  .route("/")
  .post(
    auth.authentication,
    // auth.authorization,
    LifetimePlanValidation.createLTPlanIsValid,
    lifetimePlanController.createLifetimePlan
  )

// lifetimeSubscription

/**
 * @method GET
 * @route base_url/api/v1/ltplans
 */
// .get(auth.authentication);

// Exports
module.exports = router;
