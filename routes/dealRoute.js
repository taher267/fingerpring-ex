const router = require("express").Router();
const dealController = require("../controllers/dealController");
const { authentication } = require("../middleware/auth");
const checkSubscription = require("../middleware/checkSubscription");
const checkSubscriptionForOffer = require("../middleware/checkSubscriptionForOffer");
const testingPurpose = require("../middleware/checkSubscriptionForOfferNew");
const checkSubscriptionForOfferDEV = require("../middleware/checkSubscriptionForOfferDEV");
const dealValidation = require("../middleware/validation/dealValidation");

router
  // @desc GET /api/v1/deal/discount
  .get("/discount", checkSubscriptionForOffer, dealController.dealDiscount)
  // .get("/dev", dealController.dev)
  // .get("/devfull", checkSubscriptionForOfferDEV, dealController.devfull)

  // @desc POST /api/v1/deal/new
  .post(
    "/new",
    authentication,
    checkSubscription,
    dealValidation.createDealIsValid,
    dealController.createDeal
  )

  // @desc POST /api/v1/deal/new
  .post(
    "/new/stripe",
    authentication,
    checkSubscription,
    dealValidation.createStripeDealIsValid,
    dealController.createStripeDeal
  )

  // @desc POST /api/v1/deal/update/:dealId
  .put(
    "/update-stripe/:dealId",
    authentication,
    checkSubscription,
    dealValidation.updateSteipeDealIsValid,
    dealController.updateStripeDeal
  )
  // @desc POST /api/v1/update/:dealId
  .put(
    "/update/:dealId",
    authentication,
    checkSubscription,
    dealValidation.updateDealIsValid,
    dealController.updateDeal
  )
  // @desc GET /api/v1/deal/my-deals/:uid
  .get(
    "/my-deals/:uid",
    authentication,
    // checkSubscription,
    dealController.singleUserDeals
  )
  // @desc GET /api/v1/deal/my-single-deal
  .get(
    "/my-single-deal/:_id",
    authentication,
    checkSubscription,
    dealController.singleDeal
  )
  // @desc DELETE /api/v1/deal/delete-deal/:dealId
  // .delete('/delete-deal/:dealId', dealController.deleteDeal);
  .delete(
    "/delete-deal/:dealId",
    authentication,
    checkSubscription,
    dealController.deleteDeal
  );

module.exports = router;
