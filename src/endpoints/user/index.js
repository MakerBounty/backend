


const router = require("express").Router();

// create new user
router.post("/signup", require("./signup"));

// login user
router.post("/signin", require("./signin"));

// describe another user (or self)
router.get("/describe/:username", require("./describe"));

// change user settings
router.post("/edit"), require("./edit");

module.exports = router;