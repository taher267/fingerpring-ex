const router = require('express').Router();
const userController = require('../controllers/userController');

const auth = require('../middleware/auth');
// All Requires

// ROUTE
router
  /**
   * @route base_url/api/v1/user/api/allusers
   * @method GET
   */
  .get(
    '/api/allusers',
    auth.authentication,
    auth.authorization,
    userController.getAllUsersExports
  )
  /**
   * @route base_url/api/v1/user/api/user/:id
   * @method GET
   */
  .get(
    '/api/user/:id',
    auth.authentication,
    auth.authorization,
    userController.getsingleUserExports
  )

  /**
   * @route base_url/api/v1/user/api/user/:id
   * @method POST
   */
  .post(
    '/api/user/update/:id',
    auth.authentication,
    auth.authorization,
    userController.updateUser
  );

/**
 * @method POST
 * @route base_url/api/v1/user/update-token-user
 */
// .post('/update-token-user', updateTokenOfUser);

// Exports
module.exports = router;
