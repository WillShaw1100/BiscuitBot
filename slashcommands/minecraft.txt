const { Channel, Message, EmbedBuilder } = require("discord.js");
const { ping } = require("minecraft-server-ping")


const run = async (client, interaction) => {
    try{
        const data = await ping('149.86.27.51', 25565, {timeout: 500});
        const statusEmbed = new EmbedBuilder()
        .setTitle("Game Server Status")
        .setDescription("Details the status of the creative minecraft server.")
        .addFields([
            {name: 'Minecraft Creative:', value: `IP: 149.86.27.51 \n\nPing: ${data.ping}ms` },
            {name: 'Version:', value: `${data.version.name}` },
            {name: 'Players Online:', value: `${data.players.online}` },
        ])

        interaction.reply( { embeds: [statusEmbed] })

    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply("The Creative Server is currently offline")
    }

}
}

module.exports = {
    name: "minecraft",
    type: 1,
    category: 'General',
    description: "Gets the status of our creative minecraft server",
    perm: "",
    run
}
