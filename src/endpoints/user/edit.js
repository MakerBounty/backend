const debug = require("debug")("core:endpoints:user:edit");
const validator = require("validator");
const globals = require("../../globals");
const db = require("../../db");
const auth = require("../../auth");


// POST /user/change
/*Body:
    {
        "field" : "new value"
    }
*/
module.exports = async (req, res) => {
    const user = await auth.authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    const userId = user.userId;

    let field = Object.keys(req.body)[0];
    if (!field)
        return res.status(400).send("missing field to modify");
    
    let value = req.body[field];
    // validate field
    if (field == "email" && !validator.isEmail(req.body[field])) {
        debug("invalid email: %s", value);
        return res.status(400).send("invalid email");

    // not case senseitive usernames
    } else if (field == "username") {
        value = value.toLowerCase();
    
    // need to hash password
    } else if (field == "password") {
        field = "hashedPassword";
        value = await auth.getPasswordHash(userId, value);

    // only can change these fields
    } else if (!["email", "username", "password", "bio", ].includes(field)) {
        debug("invalid field: %s", field);
        return res.status(400).send("invalid field");
    }
    
    debug("update user#%d SET %s = %s", userId, field, value);
    db.queryProm(`UPDATE users SET ${ field } = ? WHERE userId = ?`, [ value, userId ], false)
        .then(() => res.status(200).send("done"))
        .catch(debug);

};