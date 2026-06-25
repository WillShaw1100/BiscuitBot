const asyncHandler = require('../middleware/asyncHandler');
const permissionService = require('../services/permission.service');
const discordService = require('../services/discord.service');
const { logAction } = require('../utils/auditLogger');

exports.searchUsers = asyncHandler(async (req, res) => {
    const query = (req.query.q || '').toLowerCase();
    const guild = await discordService.getGuild(req.session.guildId);

    const results = guild.members.cache
        .filter(m => {
            const u = m.user.username.toLowerCase();
            const d = (m.displayName || '').toLowerCase();
            return u.includes(query) || d.includes(query);
        })
        .first(10)
        .map(m => ({
            id: m.user.id,
            username: m.user.username,
            displayName: m.displayName,
            avatar: m.user.displayAvatarURL()
        }));

    res.json(results);
});

exports.getUserPermissions = asyncHandler(async (req, res) => {
    const { guildId } = req.session;
    const { userId } = req.params;

    const perms = await permissionService.getUserPermissions(guildId, userId);

    // Fetch Discord member for display info
    let username = userId;
    let avatar = '';

    try {
        const guild = await discordService.getGuild(guildId);
        const member = guild.members.cache.get(userId)
            || await guild.members.fetch(userId).catch(() => null);

        if (member) {
            username = member.user.username;
            avatar = member.user.displayAvatarURL();
        }
    } catch (err) {
        console.warn(`Could not fetch Discord member for ${userId}:`, err.message);
    }

    // Normalise perms — permissionService may return a Mongoose doc
    const permissionsObj = typeof perms?.toObject === 'function'
        ? perms.toObject()
        : { ...perms };

    // Strip internal Mongoose fields
    delete permissionsObj._id;
    delete permissionsObj.__v;
    delete permissionsObj.guildId;
    delete permissionsObj.userId;

    res.json({
        userId,
        username,
        avatar,
        permissions: permissionsObj
    });
});

exports.updateUserPermissions = asyncHandler(async (req, res) => {
    const { guildId } = req.session;
    const { userId } = req.params;

    const updated = await permissionService.updateUserPermissions(
        guildId,
        userId,
        req.body
    );

    await logAction('permissions_update', {
        actorId: req.session.user.id,
        actorName: req.session.user.username,
        targetUserId: userId,
        permissions: typeof updated?.toObject === 'function'
            ? updated.toObject()
            : updated
    });

    res.json({ success: true, permissions: updated });
});

exports.listPermissionedUsers = asyncHandler(async (req, res) => {
    const { guildId } = req.session;

    const users = await permissionService.getAllUsersWithPermissions(guildId);

    // Fetch guild once, then enrich each user from Discord cache
    let guildMembers = null;
    try {
        const guild = await discordService.getGuild(guildId);
        guildMembers = guild.members.cache;
    } catch (err) {
        console.warn('Could not fetch guild members:', err.message);
    }

    const results = users.map(u => {
        const member = guildMembers?.get(u.userId);
        return {
            id: u.userId,
            username: member?.user?.username ?? u.username ?? u.userId,
            avatar: member?.user?.displayAvatarURL() ?? u.avatar ?? ''
        };
    });

    res.json(results);
});