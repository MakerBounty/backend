const debug = require("debug")("core:globals");

const config = {
    default: {
        pw_salt: "3rkjn34jfqknjnqgk5nkjenKJNJ$jtnqk",


    },
    
    development: {
        port: 8080,
        db: {
            host: "localhost",
            user: "root",
            password: "password",
            database: "makerbounty",
        },
        ro_db: {
            host: "localhost",
            user: "root",
            password: "password",
            database: "makerbounty",
        }
    },
    
    production: {
        port: 80,
        // todo, use production database..
        db: {
            host: "localhost",
            user: "root",
            password: "password",
            database: "makerbounty",
        },
        ro_db: {
            host: "localhost",
            user: "root",
            password: "password",
            database: "makerbounty",
        }
    }
};



const env = process.env.NODE_ENV;
if (!config[env]) {
    debug("Invalid/Missing environment configuration '%s'", env);
    debug("Possible values for NODE_ENV are: %s", Object.keys(config).join(','));
    process.exit(1);
}


module.exports = Object.assign(config.default, config[env]);
module.exports.env = env;