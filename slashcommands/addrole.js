const { Channel, Message, MessageActionRow, MessageSelectOptionData, MessageSelectMenu } = require("discord.js")

const run = async (client, interaction) => {
    const msgID = (interaction.options.getString('message_id'))
    const channel = (interaction.options.getChannel('channel'))
    const role = (interaction.options.getRole('role'))
    if(!channel || channel.type !== 'GUILD_TEXT')
        return interaction.reply('Please tag a text channel')
    if(!role)
        return interaction.reply('Unknown Role')
    
    try{
        const targetMessage = await channel.messages.fetch(msgID, {
            cache: true,
            force: true
        })
        if(!targetMessage)
            return interaction.reply({
                content: "Unknown Message ID",
                ephemeral: true
            })

        if(targetMessage.author.id !== client.user?.id){
            return interaction.reply({
                content: `Please provide a message ID that was sent from <@${client.user?.id}>`,
                ephemeral: true
        })
    }

    let row = targetMessage.components[0]
    if(!row){
        row = new MessageActionRow()
    }

    const option =[{
        label: role.name,
        value: role.id
    }]

    let menu = row.components[0]
    if(menu){
        for(const o of menu.options){
            if(o.value === option[0].value){
                return interaction.reply({
                    content: `<@&${o.value}> is already part of this menu.`,
                    ephemeral: true,
                    allowedMentions: {
                        roles: []
                    }
            })
            }
        }

        menu.addOptions(option)
        menu.setMaxValues(menu.options.length)
    }else{
        row.addComponents(
            new MessageSelectMenu()
            .setCustomId('auto_roles')
            .setMinValues(0)
            .setMaxValues(1)
            .setPlaceholder('Select Your Roles...')
            .addOptions(option)
        )
    }
    targetMessage.edit({
        components: [row]
    })
    return interaction.reply({
            content: `Added <@&${role.id}> to the auto roles menu.`,
            ephemeral: true,
            allowedMentions: {
                roles: []
            }
        })

    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }

}
}

module.exports = {
    name: "addrole",
    category: 'Configuration',
    description: "Add a role to the auto role message",
    perm: "ADMINISTRATOR",
    minArgs: 3,
    maxArgs: 3,
    expectedArgs: '<channel> <message_id> <role>',
    options: [
        {
            name: "channel", description: "The channel to send the message to",
            type: "CHANNEL", required: true
        },
        {
            name: "message_id", description: "The message ID",
            type: "STRING",
            required: true
        },
        {
            name: "role", description: "The role to add",
            type: "ROLE",
            required: true
        }
    ],
    run
    
}