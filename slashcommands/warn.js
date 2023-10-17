const { Channel, Message, EmbedBuilder, PermissionsBitField } = require("discord.js")

const run = async (client, interaction) => {

    let modlog = await interaction.guild.channels.cache.get('539063180929007627');
    let staffguild = client.guilds.cache.get('584127310182219776'), // returns a Guild or undefined
    channel; 
    let modlog2 = await staffguild.channels.cache.get('584131331303145473');

    let member = interaction.options.getMember("user")
    let reason = interaction.options.getString("reason") || "No reason given"

    if (!member) return interaction.reply("Invalid member")
    if(member.user.id === client.user.id)return interaction.reply({
        content: "You can't warn this person.",
        ephemeral: true
    })
    const roleId = "523834204610494475" //Staff Role
	const memberRoles = member.roles;
	const isStaff = memberRoles.cache.has(roleId)
    if(isStaff)return interaction.reply({
        content: "You can't warn this person.",
        ephemeral: true
    })

    try {
        const warnembed = new EmbedBuilder()
          .setTitle(`Staff Command Executed!`)
          .setThumbnail(client.user.displayAvatarURL())
          .setColor("Purple")
          .addFields([
            {name: 'Action:', value: '**Warn**' },
            {name: 'User:', value: `${member.user.tag}` },
            {name: 'User Nickname:', value: `${member.user.displayName}` },
            {name: 'User ID:', value: `${member.user.id}` },
            {name: 'Moderator:', value: `${interaction.member.user.tag}` },
            {name: 'Moderator Nickname:', value: `${interaction.member.displayName}` },
            {name: 'Moderator ID:', value: `${interaction.member.user.id}` },
            {name: 'Reason:', value: `${reason}` },
          ])
          .setTimestamp(new Date());
    
        if(modlog) modlog.send({ embeds: [warnembed] });
        if(modlog2) modlog2.send({ embeds: [warnembed] });
         interaction.reply(`${member.user.tag} has been warned for ${reason}`)

    }
    catch(err){
        if (err){
            console.error(err)
            return interaction.reply({
                content: `Failed to warn ${member.user.tag}`,
                ephemeral: true
            })
        }
    }
}

module.exports = {
    name: "warn",
    type: 1,
    category: "Staff",
    description: "Warn a User",
    perm: PermissionsBitField.Flags.BanMembers,
    options: [
        {
            name: "user", description: "The user to warn",
            type: 6, required: true
        },
        {
            name: "reason",
            description: "reason for the warn",
            type: 3,
            required: true
        }
    ],
    run
}