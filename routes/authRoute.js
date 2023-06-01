const authController = require('../controllers/authController');
const authValidation = require('../middleware/validation/authValidation');
const {
  verifyCustomTokenMiddleware,
} = require('../middleware/verifyCustomToken');

// All Requires
const router = require('express').Router();
router
  // ROUTE
  /**
   * @method POST
   * @route base_url/api/v1/auth/email-password-register
   */
  .post('/email-password-register', authController.emailPasswordRegister)

  /**
   * @method POST
   * @route base_url/api/v1/auth/email-password-register-with-otp
   */
  .post(
    '/email-password-register-with-otp',
    authValidation.emailPasswordRegisterIsValid,
    authController.emailPasswordRegisterWithOTP
  )

  /**
   * @method POST
   * @route base_url/api/v1/auth/veriry-otp-with-loggedIn-user
   */
  .put('/veriry-otp-with-loggedIn-user', authController.veriryOTPAndUpdateUser)

  /**
   * @method POST
   * @route base_url/api/v1/auth/email-password-login
   */
  .post(
    '/email-password-login',
    authValidation.emailPasswordLoginIsValid,
    authController.emailPasswordLogin
  )

  /**
   * @method POST
   * @route base_url/api/v1/auth/check-existing-user-otp
   */
  .post('/check-existing-user-otp', authController.isExistOTPUser);

/**
 * @method GET
 * @route base_url/api/v1/auth/recreateToken
 */
// .get('/recreateToken', verifyCustomTokenMiddleware, recreateToken);

// Exports
module.exports = router;
