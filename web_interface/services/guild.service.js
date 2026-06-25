exports.setSelectedGuild = (req, guildId) => {
    if (!req.session.user.guilds.some(g => g.id === guildId)) {
        const err = new Error("User not in that guild");
        err.status = 403;
        throw err;
    }

    req.session.guildId = guildId;
    return guildId;
};
