const router = require("express").Router();

router.post("/create", require("./create"));
router.get("/describe/long/:bountyThreadId", require("./describe").longDesc);
router.get("/describe/short/:bountyThreadId", require("./describe").shortDesc);


module.exports = router;