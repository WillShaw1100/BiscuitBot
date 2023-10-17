const { Channel, Message, EmbedBuilder } = require("discord.js")



const run = async (client, interaction) => {
    const bot_version = "2.2";
    const bot_owner = "williamshaw";
    const server_count = client.guilds.cache.size;

    try{
        const botInfoEmbed = new EmbedBuilder()
        .setTitle("Bot Info")
        .setDescription("Information about the Bot.")
        .setColor('Random')
        .addFields([
            {name: 'Bot Version:', value: `${bot_version}` },
            {name: 'Lead Developer:', value: `${bot_owner}` },
            {name: 'Server Count', value: `${server_count}` },
        ])

        interaction.reply( { embeds: [botInfoEmbed] })

    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }
}
}
module.exports = {
    name: "version",
    type: 1,
    category: 'Staff',
    description: "Bot's Version",
    perm: "",
    run
}