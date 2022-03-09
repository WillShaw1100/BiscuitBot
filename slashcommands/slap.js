const { Channel, Message, MessageAttachment } = require("discord.js")

const srando_imgs = [
    'https://i.giphy.com/media/3XlEk2RxPS1m8/giphy.gif',
    'https://i.giphy.com/media/mEtSQlxqBtWWA/giphy.gif',
    'https://i.giphy.com/media/j3iGKfXRKlLqw/giphy.gif',
    'https://i.giphy.com/media/2M2RtPm8T2kOQ/giphy.gif',
    'https://i.giphy.com/media/l3YSimA8CV1k41b1u/giphy.gif',
    'https://i.giphy.com/media/WLXO8OZmq0JK8/giphy.gif',
    'https://media.giphy.com/media/uqSU9IEYEKAbS/giphy.gif',
    'https://media.giphy.com/media/l2SpSQLpViJk9vhmg/giphy.gif'
  ]

const run = async (client, interaction) => {
    const args = (interaction.options.getString('text'))
    const person = (interaction.options.getUser('person'))
    if(!person)
        return interaction.reply('Please tag a person')
    try{
        if(!args){
             text = `<@${interaction.member.user.id}> slapped ${person}`
        }
        else{
             text = `<@${interaction.member.user.id}> slapped ${person} because ${args}`
        }

        interaction.channel.send(text)
        interaction.channel.send(srando_imgs[Math.floor(Math.random() * srando_imgs.length)])
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
    name: "slap",
    category: 'Fun',
    description: "Slap a person",
    perm: "",
    minArgs: 2,
    expectedArgs: '<person> <message>',
    options: [
        {
            name: "person", description: "The person to slap",
            type: "USER", required: true
        },
        {
            name: "text", description: "Why did you slap them?",
            type: "STRING",
            required: false
        }
    ],
    run
}