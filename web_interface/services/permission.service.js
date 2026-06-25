const Permission = require('../../models/Permission');
const config = require("../../config");

exports.getUserPermissions = async (guildId, userId) => {
    const perm = await Permission.findOne({ guildId, userId });

    return {
        canViewManage: perm?.canViewManage || false,
        canAddScores: perm?.canAddScores || false,
        canResetSeason: perm?.canResetSeason || false,
        canEditHistorical: perm?.canEditHistorical || false,
        canManagePermissions: perm?.canManagePermissions || false
    };

    // Cannot remove the canManagePermissions permission from owners
    if (config.owners.includes(userId)) {
        base.canManagePermissions = true;
    }
};

exports.updateUserPermissions = async (guildId, userId, updates) => {

    if (config.owners.includes(userId)) {
        updates.canManagePermissions = true;
    }

    return Permission.findOneAndUpdate(
        { guildId, userId },
        { guildId, userId, ...updates },
        { upsert: true, returnDocument: 'after' }
    );
};

exports.getAllUsersWithPermissions = async guildId => {
    return Permission.find({ guildId });
};
