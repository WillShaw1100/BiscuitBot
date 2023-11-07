const { Channel, Guild, Message, EmbedBuilder, PermissionsBitField } = require("discord.js")

const run = async (client, interaction) => {
        const role = (interaction.options.getRole('role'))
        const msgToSend = (interaction.options.getString('msg_to_send'))
        const eventID = (interaction.options.getString('event_id'))

        const guildID = interaction.guild.id.toString()
        const eventURL = `https://discord.com/events/${guildID}/${eventID}`

        const guild = await client.guilds.fetch(guildID);
        let notifyLog = await guild.channels.cache.get('589411374657175574' || '539063180929007627' || '674375603876528130'); //test server || main server || staff server logs

        if(!role)
            return interaction.reply('Unknown Role')
        
            if(role.id == interaction.guild.id) { //disable @ everyone notifcations
                return interaction.reply({content: 'You can not send a notifcation to everyone, please select roles that apply to the event.',
                ephemeral: true
            })
        }
        
        try{
            interaction.guild.members.cache.forEach(member => {
                if(member.user.bot) return;

            const notifcationEmbed = new EmbedBuilder()
            .setTitle(`${member.guild.name}  Notifcation`)
            .setDescription(`This notifcation was sent by the ${member.guild.name} Staff Team`)
            .setThumbnail(member.guild.iconURL())
            .addFields(
                { name: '\u200B', value: msgToSend },
                { name: '\u200B', value: '\u200B' },
                { name: '\u200B', value: `Notifcation sent by ${interaction?.member?.user.username}`},
                { name: 'Notes', value: 'Please do not reply here! Instead reply in the main Discord Server!'},
            )
            .setColor("Purple")
            .setTimestamp();

                if (member.roles.cache.has(role.id)) member.send({embeds: [notifcationEmbed]});
                if (eventID == null) return;
                if (member.roles.cache.has(role.id)) member.send({content: eventURL}); //has to be seperate due to how discord handles content and embeds.
            })
            interaction.reply({
                content: `Users with the role: ${role} have been notified!`,
                ephemeral: true
            })

            if(notifyLog) notifyLog.send(`A notifcation was sent to users with the role: ${role.name} by ${interaction?.member?.user.username}`);

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
    name: "notify",
    type: 1,
    category: 'Events',
    description: "Notify Role Members",
    perm: PermissionsBitField.Flags.ManageEvents,
    expectedArgs: '<role> <msg_to_send> <event_id>',
    options: [
        {
            "type": 8,
            "name": "role",
            "description": "role to notfiy",
            "required": true
          },
          {
            "type": 3,
            "name": "msg_to_send",
            "description": "message to send",
            "required": true
          },
          {
            "type": 3,
            "name": "event_id",
            "description": "event id",
            "required": false
          }

    ],
    run
}