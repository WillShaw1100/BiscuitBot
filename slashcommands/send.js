const { Channel, Message } = require("discord.js")

const run = async (client, interaction) => {
    const args = (interaction.options.getString('text'))
    const channel = (interaction.options.getChannel('channel'))
    if(!channel || channel.type !== 'GUILD_TEXT')
        return interaction.reply('Please tag a text channel')
    try{
        channel.send(args)
        interaction.reply({
            content: 'Message Sent!',
            ephemeral: true
        })
    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }

}
}

module.exports = {
    name: "send",
    category: 'Configuration',
    description: "Sends a message",
    perm: "ADMINISTRATOR",
    minArgs: 2,
    expectedArgs: '<channel> <text>',
    options: [
        {
            name: "channel", description: "The channel to send the message to",
            type: "CHANNEL", required: true
        },
        {
            name: "text", description: "The text to send",
            type: "STRING",
            required: true
        }
    ],
    run
}