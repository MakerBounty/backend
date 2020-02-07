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

const querystring = require("querystring");

// trust CDN
app.set("trust-proxy", 1);


// api endpoints
app.use("/api", require("./endpoints"));

// static content
app.use("/static", express.static("./static/build", { fallthrough: true }));


if (require.main == module) 
    app.listen(globals.port, () => 
        debug("Server listening on port %d", globals.port));
