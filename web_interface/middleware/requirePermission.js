const Permission = require('../../models/Permission');
const asyncHandler = require('./asyncHandler');

module.exports = permissionKey => asyncHandler(async (req, res, next) => {
    const guildId = req.session.guildId;
    const userId = req.session.user.id;

    const perm = await Permission.findOne({ guildId, userId });

    if (!perm || !perm[permissionKey]) {
        return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
});
