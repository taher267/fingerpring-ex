const router = require('express').Router();

router.use('/auth', require('./authRoute'));
router.use('/user', require('./userRoute'));
router.use('/deal', require('./dealRoute'));
router.use('/stripe-connect', require('./stripeConnectRoute'));
router.use('/plan', require('./planRoute'));
router.use('/ltplans', require('./lifetimePlanRoute'));
router.use('/stripe', require('./stripeRoute'));
router.use('/subscription', require('./subscriptionRoute'));

module.exports = router;
