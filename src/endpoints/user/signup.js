const debug = require("debug")("core:endpoints:signup");

const validator = require("validator");

const globals = require("../../globals");
const db = require("../../db");


function createUser(){

}



// POST /api/user/signup
module.exports = async (req, res) => {
    /* Body:
    {
        username: "kingh2",
        password: "3rfwfn4u3nfvqkjwn4i3jreknjgen5k",
        email: "kingh2@email.gov.uk"
    }
    */


    // anything missing?
    if (!req.body.email) 
        return res.status(400).send("Missing email");
    if (!req.body.username)
        return res.status(400).send("Missing username");
    if (!req.body.password)
        return res.status(400).send("Missing password");

    // form validation
    if (req.body.username.length > 40)
        return res.status(400).send("username must be less than 40 chars");
    if (!validator.isEmail("" + req.body.email))
        return res.status(400).send("Invalid email");

    // check if username is already used
    const dupUsername = await db.queryProm("SELECT 1 FROM users WHERE username=?", [ req.body.username ], true);
    if (dupUsername instanceof Error) 
        return res.status(500).send(dupUsername.error);
    if (dupUsername.length) {
        debug("duplicate username: %s", req.body.username);
        res.status(400).send(`username '${req.body.username}' is already taken`);
    }

    // check if email is already used
    const dupEmail = await db.queryProm("SELECT 1 FROM users WHERE email=?", [ req.body.email ], true);
    if (dupEmail instanceof Error)
        return res.status(500).send(dupEmail.error);
    if (dupEmail.length) {
        debug("duplicate email: %s", req.body.email);
        res.status(400).send(`email '${req.body.email}' already in use, log in instead`);
    }

    // add them to db
    let userId;
    for (;;) {
        userId = Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER);
        
    }
};