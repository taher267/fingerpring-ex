const router = require("express").Router();
router
  .get("/", (req, res) => {
    try {

      res.send({
        mail: 'process.env.ALLOW_PAYMENT_MAIL',
      });
    } catch (e) {
      res.send({ e: e });
    }
  })
module.exports = router;
