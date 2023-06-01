const router = require("express").Router();
router
  .get("/", (req, res) => {
    try {
      const str = mongoDBURI
        ?.replace?.("mongodb+srv://", "")
        ?.split?.("/")?.[1];
      res.send({
        mail: process.env.ALLOW_PAYMENT_MAIL,
        trail: ALLOW_TRAIL,
        runningOn: process.env.NODE_ENV,
        str,
      });
    } catch (e) {
      res.send({ e: e });
    }
  })
module.exports = router;
