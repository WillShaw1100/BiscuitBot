const { Channel, Message, MessageEmbed } = require("discord.js")

const run = async (client, interaction) => {

    let modlog = await interaction.guild.channels.cache.get('539063180929007627');
    let staffguild = client.guilds.cache.get('584127310182219776'), // returns a Guild or undefined
    channel; 
    let modlog2 = await staffguild.channels.cache.get('584131331303145473');

    let member = interaction.options.getMember("user")
    let reason = interaction.options.getString("reason") || "No reason given"

    if (!member) return interaction.reply("Invalid member")
    if(member.user.id === client.user.id)return interaction.reply("You can't ban this person.")
    const roleId = "523834204610494475" //Staff Role
	const memberRoles = member.roles;
	const isStaff = memberRoles.cache.has(roleId)
    if(isStaff)return interaction.reply("You can't ban this person.")

    try {
        await interaction.guild.bans.create(member, {
            reason
        })
        
        const banembed = new MessageEmbed()
          .setTitle(`Staff Command Executed!`)
          .setThumbnail(client.user.displayAvatarURL)
          .setColor("RED")
          .addField(`Action:`, `**Ban**`)
          .addField(`User:`, `${member.user.tag}`)
          .addField(`User Nickname:`, `${member.user.displayName}`, true)
          .addField(`User ID:`, `${member.user.id}`, true)
          .addField(`Moderator:`, `${interaction.member.user.tag}`)
          .addField(`Moderator Nickname:`, `${interaction.member.displayName}`, true)
          .addField(`Moderator ID:`, `${interaction.member.user.id}`, true)
          .addField(`Reason:`, `${reason}`)
          .setTimestamp(new Date());
    
        if(modlog) modlog.send({ embeds: [warnembed] });
        if(modlog2) modlog2.send({ embeds: [warnembed] });
         interaction.reply(`${member.user.tag} has been banned for ${reason}`)

    }
    catch(err){
        if (err){
            console.error(err)
            return interaction.reply(`Failed to ban ${member.user.tag}`)
        }
    }
}

module.exports = {
    name: "ban",
    category: "Staff",
    description: "Bans a member",
    perm: "BAN_MEMBERS",
    options: [
        {
            name: "user", description: "The user to ban",
            type: "USER", required: true
        },
        {
            name: "reason",
            description: "reason for the ban",
            type: "STRING",
            required: true
        }
    ],
    run
}