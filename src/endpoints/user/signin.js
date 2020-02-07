const auth = require("../../auth");
const db = require("../../db");
const debug = require("debug")("core:endpoints:user:signin");


// POST /user/signin
/* body:
{
    "username": "dansk99@outlook.com"           // can also be an email
    "password": "fsaj4kngjsnrgjq3nkjnsklrnzktusn5KnKKS"
    "duration": 1                               // set to truthy value to "stay logged in"
}
*/
module.exports = async (req, res) => {
    const { login, password, duration } = req.body;
    
    const user = await db.queryProm(`SELECT userId, hashedPassword FROM users 
        WHERE ${login.match(/\@/) ? "email" : "username"} = ?`, [ login.toLowerCase(), ], true);
    
    if (user instanceof Error)
        return res.status(500).send({ message: user.message });

    if (!user.length) {
        debug("user not found %s", login);
        return res.status(401).send("wrong email");
    }

    const pwHash = auth.getPasswordHash(user[0].userId, password);
    if (pwHash != user[0].hashedPassword) {
        debug("Wrong password for user: %s", login);
        return res.status(401).send("wrong email/password");
    }


    auth.generateToken(user[0].userId, duration)
        .then(token => res.send(token))
        .catch(e => {
            debug(e);
            res.status(500).send(e.message);
        });


};

// no login via token for this one