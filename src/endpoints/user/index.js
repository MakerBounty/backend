


const router = require("express").Router();

// route endpoints
router.post("/signup", require("./signup"));
router.get("/describe/:username", require("./describe"));
