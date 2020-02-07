

const db = require("../../db");
const debug = require("debug")("core:endpoints:thread:describe");
const thread = require("../../lib/threads");


// GET /thread/describe/short/:bountyThreadId
const shortDesc = async (req, res) => {
    
    try {
        const ret = await thread.short(req.params.bountyThreadId);
        res.json(ret);
    } catch (e) { 
        res.status(500).send(e);
        debug(e);
    }
};

// GET /thread/describe/long/:bountyThreadId
cosnt longDesc = async (req, res) => {
    try {
        const ret = await thread.detail(req.params.bountyThreadId);
        res.json(ret);
    } catch (e) {
        res.status(500).send(e);
        debug(e);
    }
};