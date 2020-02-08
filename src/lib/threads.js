const db = require("../db");
const debug = require("debug")("core:lib:threads");

// Views CDN cache management
let threadViewsDelta = {};

// load views counters into cache
function incrViews(bountyThreadId) {
    if (threadViewsDelta[bountyThreadId]) {
        threadViewsDelta[bountyThreadId]++;
    } else {
        threadViewsDelta[bountyThreadId] = 1;
    }
}

// update item view counters in database
async function updateViews() {
    // populate db update promise arr
    const proms = Object.keys(threadViewsDelta).map(id => 
        db.queryProm("UPDATE bountyThreads SET views = views + ? WHERE bountyThreadId = ?", 
            [ threadViewsDelta[id], id], false).catch(e => {
                debug("updateView: ", e);
                return e;
            }));

    const succ = await Promise.all(proms);

    // we're now in sync with server
    threadViewsDelta = {};

    debug("successfully updated %d thread view counters", 
        succ.filter(r => !(r instanceof Error)).length);

}

// update view counters every 5min
setInterval(updateViews, 1000 * 60 * 5);


async function describeComment(commentId){
    // needed?
}


// get full thread contents incl all comments
async function detail(bountyThreadId) {
    // get original thread post
    const otp_prom = db.queryProm(`SELECT title, tags, specBody, opUserId, views, ts
        FROM bountyThreads WHERE bountyThreadId = ?`, [ bountyThreadId ], true);
    // get comments
    const com_prom = db.queryProm(`SELECT bountyCommentId, authorUserId, body, review, ts
        FROM bountyComments WHERE bountyThreadId = ?`, [ bountyThreadId ], true);
    // get thread votes
    const tv_prom = db.queryProm(`SELECT SUM(direction) AS score FROM bountyVotes 
        WHERE bountyThreadId=?`, [ bountyThreadId ], true);
    // get comment votes
    const cv_prom = db.queryProm(`SELECT SUM(direction) AS score
        FROM commentVotes WHERE bountyCommentId in (
            SELECT bountyCommentId FROM bountyComments 
                WHERE bountyThreadId = ?) GROUP BY bountyCommentId`, [ bountyThreadId ], true);
    // number of people watching the data
    const bw_prom = db.queryProm(`SELECT COUNT(*) AS watchers FROM bountyWatch 
        WHERE bountyThreadId = ?`, [ bountyThreadId ], true);

    // add a view
    incrViews(bountyThreadId);

    let [ otp , com, tv, cv ] = await Promise.all([ otp_prom, com_prom, tv_prom, cv_prom ]);

    otp = otp[0];
    otp.score = tv[0].score;

    otp.views += threadViewsDelta[bountyThreadId];

    // get comment votes
    for (let i = 0; i < com.length; i++)
        com[i].score = cv.find(s => s.bountyCommentId == com[i].bountyCommentId).score;

    otp.comments = com;

    return otp;

}

// short description of thread ie - for a stream
async function short(bountyThreadId) {
    // get original thread post
    const otp_prom = db.queryProm(`SELECT title, tags, specBody, opUserId, ts
        FROM bountyThreads WHERE bountyThreadId = ?`, [ bountyThreadId ], true);
    
    // number of comments
    const com_prom = db.queryProm(`SELECT COUNT(*) as count
        FROM bountyComments WHERE bountyThreadId = ?`, [ bountyThreadId ], true);

    const sln_prom = db.queryProm(`SELECT COUNT(*) as slnCount
        FROM bountyComments WHERE bountyThreadId=? AND 
        review IN ("pending-solution", "accepted", "rejected")`
        [ bountyThreadId ], true);
    
    // number of people watching the data
    const bw_prom = db.queryProm(`SELECT COUNT(*) AS watchers FROM bountyWatch 
        WHERE bountyThreadId = ?`, [ bountyThreadId ], true);
    // get thread votes
    const tv_prom = db.queryProm(`SELECT SUM(direction) AS score FROM bountyVotes 
        WHERE bountyThreadId=?`, [ bountyThreadId ], true);
    
    incrViews(bountyThreadId);
    let [ [ otp ], [ com ], [ sln ], [ bw ], [ tv ] ] = await Promise.all([
         otp_prom, com_prom, sln_prom, bw_prom, tv_prom ]);

    otp.comments = com.count;
    otp.solutions = sln.slnCount;
    otp.watching = bw.watchers;
    otp.score = tv.score;
    otp.views += threadViewsDelta[bountyThreadId];

    return otp;

}


module.exports = {
    incrViews, updateViews, detail, short,
};