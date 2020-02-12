const debug = require("debug")("core:endpoints:thread:watch");
const db = require("../../db");
const auth = require("../../auth");

// POST /thread/watch/:bountyThreadId
module.exports = async (req, res) => {
    const user = await auth.authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    const userId = user.userId;

    const [ bt ] = await db.queryProm(`SELECT bountyThreadId FROM bountyThreads 
        WHERE bountyThreadId=?`, [ req.params.bountyThreadId ], true);
    if (!bt)
        return res.status(400).send("invalid bountyThreadId");

    const _ = await db.queryProm(`INSERT INTO bountyWatch (bountyThreadId, userId, ts)
        VALUES (?, ?, ?)`, [ bountyThreadId, userId, Date.now() ], false);
    
    res.send("done");

};