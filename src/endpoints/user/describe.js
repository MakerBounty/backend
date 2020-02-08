
const debug = require("debug")("core:endpoints:user:describe");
const db = require("../../db");

// GET /user/describe/:username
module.exports = async (req, res) => {

    const user = await authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    const userId = user.userId;


    if (!req.params.username)
        return res.status(400).send();

    const result = await db.queryProm(`SELECT userId, email, username,${ req.query.nobio ? "" : " bio," } createdTs )
        FROM users WHERE username=?;`, [ req.params.username, ], true);

    if (result instanceof Error)
        return res.status(500).send(result.error);

    if (!user.length) {
        debug("user not found: %s", req.params.username);
        return res.status(404).send("user not found");
    }
    
    res.json(result[0]);

};