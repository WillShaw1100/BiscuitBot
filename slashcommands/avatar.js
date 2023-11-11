const { Channel, Message, EmbedBuilder } = require("discord.js")

const run = async (client, interaction) => {
    const avatarUser = interaction.options.getUser('user')
    try{
        const avatarEmbed = new EmbedBuilder()
        .setImage(avatarUser.displayAvatarURL({dynamic: true, size: 4096}))
        .setColor("Random")
        .setTimestamp()

        await interaction.reply({embeds: [avatarEmbed]})

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
    name: "avatar",
    type: 1,
    category: 'Fun',
    description: "Get a persons avatar",
    perm: "",
    expectedArgs: '<user>',
    options: [
        {
            "type": 6,
            "name": "user",
            "description": "user to get avatar from",
            "required": true
        },
    ],
    run
}