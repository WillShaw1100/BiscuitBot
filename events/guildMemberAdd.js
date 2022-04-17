const generateImage = require("../generateImage")

module.exports = {
    name: "guildMemberAdd",
    run: async (client, member) => {
        const welcomeChannelId = "551771197042458635"
        const img = await generateImage(member)
        client.channels.cache.get(welcomeChannelId).send({
        content: `<@${member.id}> Welcome to the server!`,
        files: [img]
    })
    }
}
