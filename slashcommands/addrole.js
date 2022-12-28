const { Channel, Message, ActionRowBuilder, MessageSelectOptionData, StringSelectMenuBuilder , PermissionsBitField} = require("discord.js")

const run = async (client, interaction) => {
    const msgID = (interaction.options.getString('message_id'))
    const channel = (interaction.options.getChannel('channel'))
    const role = (interaction.options.getRole('role'))
    const userEmoji = (interaction.options.getString('emoji'))
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
        row = new ActionRowBuilder()
    }

    const option =[{
        label: `${userEmoji} ${role.name}`,
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
            new StringSelectMenuBuilder()
            .setCustomId('auto_roles')
            .setMinValues(1)
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
    type: 1,
    category: 'Configuration',
    description: "Add a role to the auto role message",
    perm: PermissionsBitField.Flags.Administrator,
    devOnly: true,
    minArgs: 3,
    maxArgs: 4,
    expectedArgs: '<channel> <message_id> <role> <emoji>',
    options: [
        {
            name: "channel", description: "The channel to send the message to",
            type: 7, required: true
        },
        {
            name: "message_id", description: "The message ID",
            type: 3,
            required: true
        },
        {
            name: "role", description: "The role to add",
            type: 8,
            required: true
        },
        {
            name: "emoji", description: "Any emojis to add",
            type: 3,
            required: true
        }
    ],
    run
    
}