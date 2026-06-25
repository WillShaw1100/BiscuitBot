const { getMutualGuilds } = require('./discord.service');

exports.setSelectedGuild = (req, guildId) => {
    const mutualGuilds = getMutualGuilds(req.session.user.guilds);

    if (!mutualGuilds.some(g => g.id === guildId)) {
        const err = new Error("Guild not available (bot not in guild or user not in guild)");
        err.status = 403;
        throw err;
    }

    req.session.guildId = guildId;
    return guildId;
};

