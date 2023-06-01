// All Requires
const stripeRoutes = require('../controllers/stripeController');
// const { isAuthenticated } = require('../middleware/firebase/firebaseAdmin');
const auth = require('../middleware/auth');
const stripeValidation = require('../middleware/validation/stripeValidation');
const router = require('express').Router();

/**
 * @method GET
 * @route base_url/api/v1/stripe/get-prices
 */
router.get('/get-prices', stripeRoutes.getPrices);
/**
 * @method GET
 * @route base_url/api/v1/stripe/create-session
 */

router.post(
  '/create-session',
  auth.authentication,
  stripeValidation.createSessionIsValid,
  stripeRoutes.createSession
);
/**
 * @method GET
 * @route base_url/api/v1/stripe/check-subscription
 */
router.post(
  '/check-subscription',
  auth.authentication,
  stripeRoutes.checkSubscription
);
module.exports = router;
