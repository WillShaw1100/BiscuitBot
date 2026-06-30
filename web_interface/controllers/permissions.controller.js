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

// Fields to ignore when diffing old vs new permissions for the audit log
const PERMISSION_DIFF_IGNORE_KEYS = new Set(['_id', '__v', 'guildId', 'userId', 'updatedAt']);

exports.updateUserPermissions = asyncHandler(async (req, res) => {
    const { guildId } = req.session;
    const { userId } = req.params;

    // Capture the "before" state so we can log a real old -> new diff
    const before = await permissionService.getUserPermissions(guildId, userId);
    const beforeObj = typeof before?.toObject === 'function'
        ? before.toObject()
        : { ...(before || {}) };

    const updated = await permissionService.updateUserPermissions(
        guildId,
        userId,
        req.body
    );

    const afterObj = typeof updated?.toObject === 'function'
        ? updated.toObject()
        : { ...updated };

    const changes = Object.keys(afterObj)
        .filter(key => !PERMISSION_DIFF_IGNORE_KEYS.has(key))
        .filter(key => beforeObj[key] !== afterObj[key])
        .map(key => ({
            key,
            from: beforeObj[key] ?? false,
            to: afterObj[key]
        }));

    // Resolve the target's username from Discord rather than trusting the
    // client-supplied targetUserName, falling back to it if the lookup fails.
    let targetUserName = req.body.targetUserName || userId;
    let guildName = null;

    try {
        const guild = await discordService.getGuild(guildId);
        guildName = guild?.name || null;

        const member = guild.members.cache.get(userId)
            || await guild.members.fetch(userId).catch(() => null);

        if (member) {
            targetUserName = member.user.username;
        }
    } catch (err) {
        console.warn(`Could not fetch Discord member for ${userId}:`, err.message);
    }

    await logAction('permissions_update', {
        actorId: req.session.user.id,
        actorName: req.session.user.username,
        guildId,
        guildName,
        targetUserId: userId,
        targetUserName,
        changes
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