const db = require("../db");
const debug = require("debug")("core:lib:threads");

/// TODO: refactor this, save memory, things might not be defined for new posts


// Views CDN cache management
const threadViews = {};
const threadViewsDelta = {};

// load views counters into cache
async function loadViews(){

    // fetch from db
    const resp = await db.queryProm("SELECT bountyThreadId, views FROM bountyThreads", [], true);
    if (resp instanceof Error) {
        debug("loadViews failed: %s", resp);
        return
    }

    // load into cache
    for (const o of resp) {
        threadViews[o.bountyThreadId] = o.views;
        threadViewsDelta[o.bountyThreadId] = 0;
    }
    debug("successfully loaded %d thread view counters");
}

// update item view counters in database
async function updateViews() {
    const proms = [];
    for (const id in threadViewsDelta)
        if (threadViewsDelta[id] != 0)
            proms.push(db.queryProm("UPDATE bountyThreads SET view = views + ? WHERE bountyThreadId = ?", [
                threadViewsDelta[id], id
            ], false).catch(e => debug("updateView: ", e)));

    const succ = await Promise.all(proms);

    debug("successfully updated %d thread view counters", 
        succ.filter(r => !(r instanceof Error)).length);

    await loadViews();

}

// load views 2 seconds after starting api server
setTimeout(loadViews, 2000);

// update view counters every hour
setInterval(updateViews, 1000 * 60 * 60);


async function describeComment(commentId){
    // needed?
}


// get full thread contents incl all comments
async function detail(bountyThreadId) {
    // get original thread post
    const otp_prom = db.queryProm(`SELECT title, tags, specBody, opUserId, ts
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
    threadViewsDelta[bountyThreadId]++;

    let [ otp , com, tv, cv ] = await Promise.all([ otp_prom, com_prom, tv_prom, cv_prom ]);

    otp = otp[0];
    otp.score = tv[0].score;

    otp.views = threadViews[bountyThreadId] + threadViewsDelta[bountyThreadId];    

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

    threadViewsDelta[bountyThreadId]++;
    
    // number of people watching the data
    const bw_prom = db.queryProm(`SELECT COUNT(*) AS watchers FROM bountyWatch 
        WHERE bountyThreadId = ?`, [ bountyThreadId ], true);
    // get thread votes
    const tv_prom = db.queryProm(`SELECT SUM(direction) AS score FROM bountyVotes 
        WHERE bountyThreadId=?`, [ bountyThreadId ], true);
    
    let [ [ otp ], [ com ], [ sln ], [ bw ], [ tv ] ] = await Promise.all([
         otp_prom, com_prom, sln_prom, bw_prom, tv_prom ]);

    otp.comments = com.count;
    otp.solutions = sln.slnCount;
    otp.watching = bw.watchers;
    otp.score = tv.score;
    otp.views = threadViews[bountyThreadId] + threadViewsDelta[bountyThreadId];
    
    return otp;
    
}


module.exports = {
    loadViews, updateViews, detail, short,
};