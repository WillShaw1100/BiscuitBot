const { Channel, Message, ChannelType, PermissionsBitField} = require("discord.js")

const run = async (client, interaction) => {
    const args = (interaction.options.getString('text'))
    const channel = (interaction.options.getChannel('channel'))
    if(!channel)
        return interaction.reply('Please tag a text channel')
    if(!channel.type == 'GUILD_TEXT')
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
        return interaction.reply({
            content:'Failed to perform this command',
            ephemeral: true
        })
    }
}
}

module.exports = {
    name: "send",
    type: 1,
    category: 'Configuration',
    description: "Sends a message",
    perm: PermissionsBitField.Flags.Administrator,
    minArgs: 2,
    expectedArgs: '<channel> <text>',
    options: [
        {
            name: "channel", description: "The channel to send the message to",
            type: 7, required: true
        },
        {
            name: "text", description: "The text to send",
            type: 3,
            required: true
        }
    ],
    run
}