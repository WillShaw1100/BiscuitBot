const { Channel, Message } = require("discord.js")

const run = async (client, interaction) => {
    try{
         interaction.reply('Blame Max, The only real admin is Mitch.');
        
    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }

}
}

module.exports = {
    name: "blame",
    category: 'Fun',
    description: "Blame Mitch",
    perm: "",
    maxArgs: 0,
    expectedArgs: '',
    run
}