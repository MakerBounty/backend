

const db = require("../../db");
const debug = require("debug")("core:endpoints:thread:describe");
const thread = require("../../lib/threads");
const auth = require("../../auth");

// GET /thread/describe/short/:bountyThreadId
const shortDesc = async (req, res) => {
    const user = await auth.authUserSafe(req.get("Authorization"));

    try {
        const ret = await thread.short(req.params.bountyThreadId, user.userId);
        res.json(ret);
    } catch (e) { 
        res.status(500).send(e);
        debug(e);
    }
};

// GET /thread/describe/long/:bountyThreadId
const longDesc = async (req, res) => {
    const user = await auth.authUserSafe(req.get("Authorization"));

    try {
        const ret = await thread.detail(req.params.bountyThreadId, user.userId);
        res.json(ret);
    } catch (e) {
        res.status(500).send(e);
        debug(e);
    }
};

module.exports = {
    shortDesc, longDesc
};