const generateImage = require("../generateImage")
const { Message, EmbedBuilder } = require("discord.js");
const welcomeSchema = require("../models/welcomeSchema");

module.exports = {
    name: "guildMemberAdd",
    run: async (client, member) => {
        welcomeSchema.findOne({ Guild: member.guild.id }, async (err, data) => {
            if(!data) return;
            let channel = data.Channel;
            let Msg = data.Msg || " ";
            let Role = data.Role;

            const {user, guild} = member;
            const welcomeChannel = member.guild.channels.cache.get(data.Channel);

           /* const welcomeEmbed = new EmbedBuilder()
            .setTitle("**New Member!**")
            .setDescription(data.Msg)
            .setColor(0x037821)
            .addFields({name: 'Total Members', value: `${guild.memberCount}`})
            .setTimestamp();*/

            const img = await generateImage(member)

            welcomeChannel.send({
                content: `<@${member.id}> ${data.Msg}`,
                files: [img]
        });
        member.roles.add(data.Role);

    })
}
}
