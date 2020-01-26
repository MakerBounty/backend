const debug = require("debug")("core:server");

const globals = require("./globals");

const express = require("express");
const bodyParser = require("body-parser");
const querystring = require("querystring");

const app = express();

// 
app.use(bodyParser());

// trust CDN
app.set("trust-proxy", 1);


// api endpoints
app.use("/api", require("./endpoints"));

// static content
app.use('/', express.static("./static/build", { fallthrough: true }));

// pages
app.use('/', require("./pages"));

if (require.main == module) 
    app.listen(globals.port, () => 
        debug("Server listening on port %d", port));