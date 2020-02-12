const router = require("express").Router();

//
router.post("/create", require("./create"));

//
router.get("/describe/long/:bountyThreadId", require("./describe").longDesc);
router.get("/describe/short/:bountyThreadId", require("./describe").shortDesc);


// actions 
// vote
router.post("/vote/:bountyThreadId/:direction", require("./vote"));
// watch
router.post("/watch/:bountyThreadId", require("./watch"));

// comments
router.post("/comment/create/:bountyThreadId", require("./comment/create"));


module.exports = router;