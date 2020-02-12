const debug = require("debug")("core:endpoints:thread:vote");
const db = require("../../db");
const auth = require("../../auth");


// *POST* /thread/vote/:bountyThreadId/:direction
// direction = 'up' | 'down' | 'null'

module.exports = async (req, res) => {
    const user = await auth.authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    const userId = user.userId;

    
    if (!["up", "down", "null"].includes(req.params.direction))
        return res.status(400).send("invalid direction - expected 'up', 'down', or 'null'");
    
    // unvote
    if (req.params.direction == "null") {
        const _ = await db.queryProm("DELETE FROM bountyVotes WHERE bountyThreadId=? AND userId=?",
            [ req.params.bountyThreadId, userId ], false);
        return res.send("done");
    }
    
    // add new vote
    const _ = await db.queryProm(`INSERT INTO bountyVotes (bountyThreadId, userId, direction, ts) VALUES (?, ?, ?, ?)`, [
        req.params.bountyThreadId, userId, req.params.direction == "up" ? 1 : -1, Date.now() ], false);
    
    res.send("done");
    
};