const client = require('../../core/client');

exports.ensureClientReady = () => {
    if (!client.isReady()) {
        const err = new Error("Discord bot not ready");
        err.status = 503;
        throw err;
    }
};

exports.getGuild = async guildId => {
    return client.guilds.fetch(guildId);
};

exports.getGuildMember = async (guildId, userId) => {
    const guild = await client.guilds.fetch(guildId);
    return guild.members.fetch(userId);
};


