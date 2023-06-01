const router = require('express').Router();
const subscriptionRoutes = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

router
  /**
   * @method GET
   * @route base_url/api/v1/subscription/mine
   */
  .get('/mine', auth.authentication, subscriptionRoutes.mySubscription);

// Exports
module.exports = router;
