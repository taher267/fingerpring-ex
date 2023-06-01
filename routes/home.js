const router = require("express").Router();
router.get("/", (req, res) => {
    res.json({ message: `This is home route` });
});

module.exports = router;
