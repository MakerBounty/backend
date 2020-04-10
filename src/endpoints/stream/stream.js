

const debug = require("debug")("core:endpoints:stream:stream");
const db = require("../../db");

/* POST /stream/
Body:
{
    filter: {
        tags: [' '],
        minBounty: 20,
        accepted: true | false | undefined
    } | undefined,
    
    sort: {
        field: "bounty" | "age" | "views",
        direction: 
    } | undefined,


    limit: 10, // size of page
    offset: 10 // items to skip
}
*/
module.exports = async (req, res) => {
    let query = "SELECT bountyThreadId FROM bountyThreads WHERE ";
    let args = [];

    const { filter, sort, page, n } = req.body;

    if (filter) {
        let fqs = [];
        if (filter.tags && filter.tags.length) {
            fqs.push("JSON_CONTAINS(tags, ?, '$')");
            args.push(JSON.stringify(tags));
        }
        
        if (typeof filter.minBounty == "number") {
            fqs.push(`bountyThreadId IN (
                SELECT bountyThread FROM bountyTransactions 
                GROUP BY bountyThreadId HAVING sum(value) > ?)`);
            args.push(filter.minBounty);
        }
        
        if (accepted != undefined && accepted != null) {
            fqs.push(`bountyThreadId ${accepted ? "" : "NOT"} IN (
                SELECT bountyThreadId FROM bountyComments
                WHERE review = "accepted")`);     
        }

        query += fqs.join(" AND ");
    }

    if (sort) {
        const fieldName = {};
        
    }

};