module.exports = {
    name: "guildMemberLeave",
    run: async (client, member) => {
        const staffLog = "539063180929007627"
        client.channels.cache.get(staffLog).send({
            content: `${member.id} Left The Server`
        })
    }
}

