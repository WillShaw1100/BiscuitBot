const { Channel, Message, EmbedBuilder } = require("discord.js")

const run = async (client, interaction) => {

    let botguild = client.guilds.cache.get('589411374657175572'), // returns a Guild or undefined
    channel; 
    let suggestlog = await botguild.channels.cache.get('951085180477640744');

    let text = interaction.options.getString("feature")

    try {
        if(suggestlog) suggestlog.send(`${text} \n was suggested by ${interaction.member.user.tag}`);
        interaction.reply({
            content: `${text} has been suggested for addition. Thankyou!`,
            ephemeral: true
        })

    }
    catch(err){
        if (err){
            console.error(err)
            return interaction.reply({
                content: `Something went wrong, if this continues please get in touch with the Staff.`,
                ephemeral: true
            })
        }
    }
}

module.exports = {
    name: "suggest",
    type: 1,
    category: "General",
    description: "Suggest a feature",
    perm: "",
    options: [
        {
            name: "feature",
            description: "What feature would you like to suggest?",
            type: 3,
            required: true
        }
    ],
    run
}