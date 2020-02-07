
const db = require("../../db");

// GET /user/describe/:username
module.exports = async (req, res) => {

    const user = await authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    const userId = user.userId;


    if (!req.params.username)
        return res.status(400).send();

    const user = await db.queryProm(`SELECT userId, email, username,${ req.query.nobio ? "" : " bio," } createdTs )
        FROM users WHERE username=?;`, [ req.params.username, ], true);

    if (user instanceof Error)
        return res.status(500).send(user.error);

    res.json(user);

};