const db = require("./db");
const crypto = require("crypto");
const { pw_salt } = require("./globals");
const debug = require("debug")("core:auth");

// subsystem generates random tokens used to authenticate app users

// creates a login token for user
// returns token
async function generateToken(userId, duration) {

    // "stay logged in"
    duration = duration ? "interval 6 month" : "interval 12 hour";

    for (; ;) {
        // generate token
        // 48 random bytes produces a 64 char of b64 encoded token
        const token = crypto.randomBytes(48).toString("base64");
        // add token to db
        const error = await db.queryProm(`INSERT INTO authTokens (authToken, userId, authTokenExpiration)
                VALUES (?, ?, NOW() + ${duration})`,
            [token, userId]);
        
        if (!(error instanceof Error))
            return token;
        if (!error.message.match(/Duplicate entry/))
            throw error;
    }
}

// validates user login token
// returns user id
async function authUser(token) {
    if (token.startsWith("Bearer "))
        token = token.substr(7);

    const tok = await db.queryProm("SELECT userId, authTokenExpiration<NOW() exp FROM authTokens WHERE authToken=?",
        [token], true);
    if (tok instanceof Error)
        throw tok;
    
    if (!tok[0]) {
        debug("Token not found in database: %s", token);
        throw Error("invalid token");
    }
    if (tok[0].exp) {
        debug("Token for user %d expired: %s", tok[0].userId, token);
        throw Error("token expired");
    }
    return tok[0].userId;
}


async function authUserSafe(token) {
    if (!token)
        return { error: "Missing Authorization header" };

    let userId
    try {
        userId = await authUser(token);
    } catch (error) {
        return { error: error.toString() };
    }
    return { userId };
}


// 
function getPasswordHash(userId, password) {
    return crypto
        .createHash('sha512')
        .update(`${userId}${pw_salt}${password}`)
        .digest('hex')
}

async function requireAuthMiddleware(req, res, next) {
    const user = await authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    req.session = user;
    return next();
}

//
module.exports = { 
    getPasswordHash, authUserSafe, authUser,
    generateToken, requireAuthMiddleware 
};
