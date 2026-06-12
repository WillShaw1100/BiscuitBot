const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const run = async (client, interaction) => {
        const role = interaction.options.getRole('role');
        const msgToSend = interaction.options.getString('msg_to_send');
        const eventID = interaction.options.getString('event_id');
        
        if(!role) {
            return interaction.reply('Unknown Role')
        }
        
        if(role.id == interaction.guild.id) { //disable @ everyone notifcations
            return interaction.reply({content: 'You can not send a notifcation to everyone, please select roles that apply to the event.',
                ephemeral: true
            })
        }

        const guild = interaction.guild;
        const eventURL = eventID ? `https://discord.com/events/${guild.id}/${eventID}` : null;

        const notifyLog = guild.channels.cache.get('589411374657175574') || guild.channels.cache.get('539063180929007627') || guild.channels.cache.get('674375603876528130'); //test server || main server || staff server logs

        //pre-filter members
        const members = guild.members.cache.filter(member => member.roles.cache.has(role.id) && !member.user.bot);
        
        const embed = new EmbedBuilder()
            .setTitle(`📢 ${guild.name} Notification`)
            .setDescription(`You're receiving this because you have the **${role.name}** role.`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: "📌 Announcement", value: msgToSend },
                { name: "👤 Sent By", value: interaction?.member?.user.tag ?? "Unknown", inline: true },
                { name: "🏷️ Server", value: guild.name, inline: true }
            )
            .setFooter({ text: "Do not reply to this message. Use the server instead." })
            .setColor(0x9b59b6)
            .setTimestamp();

        try{
            for (const member of members.values()) {
                try {
                    await member.send({ embeds: [embed] });

                    if (eventURL) {
                        await member.send(`Event Link: ${eventURL}`);
                    }
                } catch (dmErr) {
                    console.error(`Failed to send notification to ${member.user.tag}:`, dmErr);
                }
            }

            await interaction.reply({
                content: `Users with the role: ${role} have been notified!`,
                ephemeral: true
            })

            if(notifyLog) notifyLog.send(`A notification was sent to users with the role: ${role.name} by ${interaction?.member?.user.tag ?? "Unknown"}. Message: ${msgToSend}${eventURL ? ` Event Link: ${eventURL}` : ''}`);
        

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