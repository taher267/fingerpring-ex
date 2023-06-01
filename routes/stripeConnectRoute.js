const router = require('express').Router();
const stripeConnectController = require('../controllers/stripeConnectController');
const auth = require('../middleware/auth');
router
  /**
   * @route baseurl/api/v1/stripe-connect/products
   * @method GET
   */
  .get('/products', auth.authentication, stripeConnectController.stripeProducts)
  /**
   * @route baseurl/api/v1/stripe-connect/accounts
   * @method GET
   */
  .get(
    '/accounts',
    auth.authentication,
    stripeConnectController.stripeConnectedAccounts
  )
  /**
   * @route baseurl/api/v1/stripe-connect/count
   * @method GET
   */
  .get(
    '/count',
    auth.authentication,
    stripeConnectController.countStripeconnect
  )
  // countStripeconnect
  /**
   * @route baseurl/api/v1/stripe-connect/stripe-auth-callback
   * @method GET
   */
  .get('/stripe-auth-callback', stripeConnectController.stripeAuth)
  .route('/coupons')
/**
 * @route baseurl/api/v1/stripe-connect/coupons
 * @method POST
 */
// .post(auth.authentication, stripeConnectController.createCoupon);

module.exports = router;
