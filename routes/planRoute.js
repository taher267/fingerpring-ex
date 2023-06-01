const router = require('express').Router();
const planRoutes = require('../controllers/planController');
const auth = require('../middleware/auth');
const planValidation = require('../middleware/validation/planValidation');
// All Requires
router
  /**
   * @method POST
   * @route base_url/api/v1/plan/new
   */
  .post('/new', planValidation.createPlanIsValid, planRoutes.createPlan)

  /**
   * @method GET
   * @route base_url/api/v1/plan/all
   */
  .get('/all', auth.authentication, planRoutes.getAllPlans);

// Exports
module.exports = router;
