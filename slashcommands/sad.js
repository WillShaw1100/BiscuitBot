const { Channel, Message } = require("discord.js")

const run = async (client, interaction) => {
    try{
        interaction.reply("Sad! 🐼")

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
    name: "sad",
    type: 1,
    category: 'Fun',
    description: "Sad 🐼",
    perm: "",
    run
}