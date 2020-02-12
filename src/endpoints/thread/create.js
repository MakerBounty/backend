const debug = require("debug")("core:endpoints:thread:create");
const db = require("../../db");
const auth = require("../../auth");


// POST /thread/create
/* Body:
{
    "title" : "Make a game",
    "tags" : ["C++", "SDL", "Linux", "game"],
    "spec" : "Guns and bombs and space ships. Teleport with buttons. Arrow keys for movement. 3d"
}
*/
module.exports = async (req, res) => {
    const user = await auth.authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    const userId = user.userId;

    if (!req.body.title)
        return res.status(400).send("missing title");
    if (!req.body.spec)
        return res.status(400).send("missing spec");
    
    if (!req.body.tags)
        req.body.tags = [];
    req.body.tags = JSON.stringify(req.body.tags);

    let bountyThreadId;
    // rng thread ID
    for (; ;) {
        bountyThreadId = Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER);
        const result = await db.queryProm(`INSERT INTO bountyThreads (bountyThreadId, title, tags, specBody, opUserId, ts) 
            VALUES (?, ?, ?, ?, ?, ?)`, [ bountyThreadId, req.body.title,
                req.body.tags, req.body.spec, userId, Date.now(), ], false);

        if (result instanceof Error) {
            if (result.message.match(/Duplicate entry '.+' for key 'PRIMARY'/))
                continue;
            return res.status(500).send(result.error);
        }

        debug("new thread: %d", bountyThreadId);
        return res.json(bountyThreadId);
        
    }

};