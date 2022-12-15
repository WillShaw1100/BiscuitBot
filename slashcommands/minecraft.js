const { Channel, Message, MessageEmbed } = require("discord.js");
const { ping } = require("minecraft-server-ping")


const run = async (client, interaction) => {
    try{
        const data = await ping('149.86.27.51', 25565, {timeout: 500});
        const statusEmbed = new MessageEmbed()
        .setTitle("Game Server Status")
        .setDescription("Details the status of the creative minecraft server.")
        .addField("Minecraft Creative: ", `IP: 149.86.27.51 \n\nPing: ${data.ping}ms`)
        .addField("Version: ", `${data.version.name}`, true)
        .addField("Players Online: ", `${data.players.online}`, true)
        .addField("Mods (If data avaialable):", `Type: ${data.modinfo.type} \n\nMod List: \n${data.modinfo.modList.toString()}`)
        


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
    category: 'General',
    description: "Gets the status of our creative minecraft server",
    perm: "",
    run
}
