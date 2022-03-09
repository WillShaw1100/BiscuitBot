    const { Channel, Message, MessageEmbed } = require("discord.js")
    const moment = require('moment');
    const filterLevels = {
      DISABLED: 'Off',
      MEMBERS_WITHOUT_ROLES: 'No Role',
      ALL_MEMBERS: 'Everyone'
  };
  
  const verificationLevels = {
      NONE: 'None',
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: '(╯°□°）╯︵ ┻━┻',
      VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
  };

const run = async (client, interaction) => {
try{
  let mainguild = client.guilds.cache.get('470229266072731679')
        const roles = mainguild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
        const members = mainguild.members.cache;
        const channels = mainguild.channels.cache;
        const emojis = mainguild.emojis.cache;
        
        const embed = new MessageEmbed()
            .setDescription(`**Server Info**`)
            .setColor('BLACK')
            .setThumbnail(mainguild.iconURL({ dynamic: true }))
            .addField('General',
                `-------
                **Name:** ${interaction.guild.name}
                **ID:** ${interaction.guild.id}
                **Region:** ${interaction.guild.preferredLocale}
                **Boost Tier:** ${interaction.guild.premiumTier ? `Tier ${interaction.guild.premiumTier}` : 'None'}
                **Explicit Filter:** ${filterLevels[interaction.guild.explicitContentFilter]}
                **Verification Level:** ${verificationLevels[interaction.guild.verificationLevel]}
                **Time Created:** ${moment(interaction.guild.createdTimestamp).format('LT')} ${moment(interaction.guild.createdTimestamp).format('LL')} [${moment(interaction.guild.createdTimestamp).fromNow()}]`,
                '\u200b'
            )
            .addField('Statistics', 
                `----------
                **Role Count:** ${roles.length}
                **Emoji Count:** ${emojis.size}
                **Regular Emoji Count:** ${emojis.filter(emoji => !emoji.animated).size}
                **Animated Emoji Count:** ${emojis.filter(emoji => emoji.animated).size}
                **Member Count:** ${interaction.guild.memberCount}
                **Text Channels:** ${channels.filter(channel => channel.type === 'GUILD_TEXT').size}
                **Voice Channels:** ${channels.filter(channel => channel.type === 'GUILD_VOICE').size}
                **Boost Count:** ${interaction.guild.premiumSubscriptionCount || '0'}`,
                '\u200b'
            )
            .addField(`Custom Roles`,` ${roles.length - 1}`)
    
            .setTimestamp();
    interaction.reply({ embeds: [embed] });

    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }

}
}

module.exports = {
    name: "memberstatus",
    category: 'Configuration',
    description: "Display some stats about the server",
    perm: "ADMINISTRATOR",
    run
}