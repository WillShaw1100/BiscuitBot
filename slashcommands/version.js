const { Channel, Message, EmbedBuilder } = require("discord.js")
const config = require('../config');



const run = async (client, interaction) => {

    const bot_version = config.version;
    const bot_owner = config.bot_owner;
    const server_count = client.guilds.cache.size;

    try {
        const botInfoEmbed = new EmbedBuilder()
            .setTitle("Bot Info")
            .setDescription("Information about the Bot.")
            .setColor('Random')
            .addFields([
                { name: 'Bot Version:', value: `${bot_version}` },
                { name: 'Lead Developer:', value: `${bot_owner}` },
                { name: 'Server Count', value: `${server_count}` },
            ])

        interaction.reply({ embeds: [botInfoEmbed] })

    } catch (err) {
        if (err) {
            console.error(err)
            return interaction.reply('Failed to perform this command')
        }
    }
}
module.exports = {
    name: "version",
    type: 1,
    category: 'General',
    description: "Bot's Version",
    perm: "",
    run
}
