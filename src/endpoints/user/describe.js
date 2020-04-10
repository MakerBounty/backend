
const debug = require("debug")("core:endpoints:user:describe");
const db = require("../../db");
const auth = require("../../auth");
// GET /user/describe/:username
module.exports.username = async (req, res) => {

    if (!req.params.username)
        return res.status(400).send();

    const result = await db.queryProm(`SELECT userId, email, username,${ 
        req.query.nobio ? "" : " bio," } createdTs FROM users WHERE username=?;`,
        [ req.params.username, ], true);

    if (result instanceof Error)
        return res.status(500).send(result.error);

    if (!result.length) {
        debug("user not found: %s", req.params.username);
        return res.status(404).send("user not found");
    }
    
    res.json(result[0]);

};

// GET /user/self
module.exports.self = async (req, res) => {
    const user = await auth.authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    const userId = user.userId;

    const ret = await db.queryProm(`SELECT userId, email, username, createdTs 
        FROM users WHERE userId=?`, [userId, ], true);
    
    if (ret instanceof Error)
        return res.status(500).send(ret.error);
    if (!ret[0]) {
        debug("invalid user token, maybe deleted account?");
        return res.status(500).send("deleted account");
    }

    res.json(ret[0]);

};