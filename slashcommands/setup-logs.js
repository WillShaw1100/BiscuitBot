const { Channel, Message, EmbedBuilder, ChannelType, PermissionsBitField} = require("discord.js")
const logSchema = require("../models/logSchema");

const run = async (client, interaction) => {
    const { channel, guildId, options } = interaction;
    const logChannel = (interaction.options.getChannel('channel') || channel)
    const logEmbed = new EmbedBuilder()

    try{
        logSchema.findOne({ Guild: guildId}, async (err, data) => {
            if (!data) {
                await logSchema.create({
                    Guild: guildId,
                    Channel: logChannel.id
                });

                logEmbed.setDescription("Data was succesfully sent to the database.")
                .setColor("Green")
                .setTimestamp();
            } else if (data) {
                await logSchema.deleteOne({ Guild: guildId });
                await logSchema.create({
                    Guild: guildId,
                    Channel: logChannel.id
                    });
    
                    logEmbed.setDescription("Old data was succesfully replaced with the new data.")
                    .setColor("Green")
                    .setTimestamp();
            }
            if (err) {
                console.log(err)
                logEmbed.setDescription("Something went wrong. Please contact the developers.")
                .setColor("Red")
                .setTimestamp();
            }
            return interaction.reply({ embeds: [logEmbed], ephemeral: true });
        })

    }catch(err){
    if (err){
        return interaction.reply({
            content: 'Failed to perform this command',
            ephemeral: true
        })
    }

}
}

module.exports = {
    name: "setup-logs",
    type: 1,
    category: 'Configuration',
    description: "Set up your logging channel for the audit logs.",
    perm: PermissionsBitField.Flags.Administrator,
    minArgs: 1,
    expectedArgs: '<channel>',
    options: [
        {
            name: "channel", description: "Channel for logging messages",
            type: 7, required: true
        },
    ],
    run
}