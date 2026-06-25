const asyncHandler = require('../middleware/asyncHandler');
const discordService = require('../services/discord.service');
const { logAction } = require('../utils/auditLogger');

exports.getBans = asyncHandler(async (req, res) => {
    const guildId = req.session.guildId;
    const guild = await discordService.getGuild(guildId);

    const bans = await guild.bans.fetch();

    const results = bans.map(ban => ({
        id: ban.user.id,
        username: ban.user.username,
        avatar: ban.user.displayAvatarURL(),
        reason: ban.reason || "No reason provided"
    }));

     await logAction('bans_viewed', {
        actorId: req.session.user.id,
        actorName: req.session.user.username,
        guildId: guildId,
    });

    res.json(results);
});
