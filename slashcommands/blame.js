const { Channel, Message } = require("discord.js")

const run = async (client, interaction) => {
    try{
         interaction.reply('Blame Max, The only real admin is Mitch.');
        
    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply({
            content: 'Failed to perform this command',
            ephemeral: true
        })
    }

}
}

module.exports = {
    name: "blame",
    type: 1,
    category: 'Fun',
    description: "Blame Mitch",
    perm: "",
    maxArgs: 0,
    expectedArgs: '',
    run
}