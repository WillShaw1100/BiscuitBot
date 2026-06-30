const Permission = require('../../models/permission');
const asyncHandler = require('./asyncHandler');

module.exports = asyncHandler(async (req, res, next) => {
    if (!req.session?.user) return next();

    const guildId = req.session.guildId;

    const perm = await Permission.findOne({
        guildId,
        userId: req.session.user.id
    });

    const defaults = {
        canViewManage: false,
        canAddScores: false,
        canResetSeason: false,
        canEditHistorical: false,
        canManagePermissions: false,
        canViewBans: false,
        canViewAuditLog: false
    };

    const merged = { ...defaults, ...(perm?.toObject() || {}) };

    req.session.permissions = merged;

    Object.assign(req.session, merged);

    req.session.lastPermissionCheck = Date.now();

    next();
});
