const debug = require("debug")("core:server");

const globals = require("./globals");

// connect to database
const db = require("./db");
db.begin()

// 
const express = require("express");

const app = express();

// parse body for POST requests
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// show all requests
const querystring = require("querystring");
app.use((req, res, next) => {
    if (req.path === "/") return next();
    const bodyString = JSON.stringify(req.body);
    const qs = querystring.stringify(req.query);
    debug(`${req.method} ${req.path}${qs ? '?' + qs : ''} body=${bodyString.length > 2 ? bodyString.length.toString() + " bytes" : "∅"} (${req.ip})`);
    next();
});


// trust CDN
app.set("trust-proxy", 1);

// for now, enable cors for all routes
const cors = require("cors");
app.use(cors({
//    optionsSuccessStatus: 200
}));

// api endpoints
app.use("/api", require("./endpoints"));

// static content
// app.use("/static", express.static("./static/build", { fallthrough: true }));

if (require.main == module) 
    app.listen(globals.port, () => 
        debug("Server listening on port %d", globals.port));
