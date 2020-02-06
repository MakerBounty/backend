


// POST /user/change
/*Body:
    {
        "ch_field" : "new value"
    }
*/
module.exports = async (req, res) => {
    const user = await authUserSafe(req.get("Authorization"));
    if (user.error)
        return res.status(401).send(user.error);
    const userId = user.userId;

    if ()
};