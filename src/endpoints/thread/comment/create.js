const debug = require("debug")("core:endpoints:thread:comment");
const db = require("../../../db");
const auth = require("../../../auth");


// POST /thread/comment/create/:bountyThreadId
/* Expected body:
{
    "type" : "comment" | "solution"
    "body" : text
}
*/
module.exports = async (req, res) => {
    const user = await auth.authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    const userId = user.userId;

    const { type, body } = req.body;
    const { bountyThreadId } = req.params;

    if (!type)
        return res.status(400).send("missing type");
    if (!["comment", "solution"].includes(type))
        return res.status(400).send("invalid type");
    if (!body)
        return res.status(400).send("missing body");
    if (!bountyThreadId)
        return res.status(400).send("missing bountyThreadId");
    
    // needed?
    const thread = await db.queryProm("SELECT 1 FROM bountyThreads WHERE bountyThreadId=?;", [bountyThreadId], true);
    if (!thread.length)
        return res.status(400).send("invalid bountyThreadId");

    // add comment
    try {
        const ins = await db.queryProm(`INSERT INTO bountyComments 
            (bountyThreadId, authorUserId, body, review, ts) VALUES
            (?, ?, ?, ?, ?);`, [ bountyThreadId, userId, body, 
                type == "comment" ? "comment" : "pending-solution", Date.now() ], false);

        res.send("done");
    } catch(e) {
        debug(e);
        res.status(500).send(e);
    }

};