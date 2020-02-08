const router = require("express").Router();

router.use("/user", require("./user"));
router.use("/thread", require("./thread"));
// router.use("/stream", require("./stream"));

module.exports = router;