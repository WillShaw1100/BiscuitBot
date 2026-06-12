const { Channel, Message, EmbedBuilder, ChannelType, PermissionsBitField, MessageFlags} = require("discord.js")
const eventChannelSchema = require("../models/eventChannelSchema");

const run = async (client, interaction) => {
    const { channel, guildId, options } = interaction;
    const eventChannel = (interaction.options.getChannel('channel') || channel)
    const eventEmbed = new EmbedBuilder()

    try{
        const data = await eventChannelSchema.findOne({ Guild: guildId});
        if (!data) {
            await eventChannelSchema.create({
                Guild: guildId,
                Channel: eventChannel.id
            });

                eventEmbed.setDescription("Data was succesfully sent to the database.")
                .setColor("Green")
                .setTimestamp();
            } else if (data) {
                await eventChannelSchema.deleteOne({ Guild: guildId });
                await eventChannelSchema.create({
                    Guild: guildId,
                    Channel: eventChannel.id
                    });
    
                    eventEmbed.setDescription("Old data was succesfully replaced with the new data.")
                    .setColor("Green")
                    .setTimestamp();
            }
            if (err) {
                console.log(err)
                eventEmbed.setDescription("Something went wrong. Please contact the developers.")
                .setColor("Red")
                .setTimestamp();
            }
            return interaction.reply({ embeds: [eventEmbed], flags: MessageFlags.Ephemeral });

    }catch(err){
    if (err){
        return interaction.reply({
            content: 'Failed to perform this command',
            flags: MessageFlags.Ephemeral
        })
    }

}
}

module.exports = {
    name: "setup-events",
    type: 1,
    category: 'Configuration',
    description: "Set up your event channel for the events to be posted.",
    perm: PermissionsBitField.Flags.Administrator,
    minArgs: 1,
    expectedArgs: '<channel>',
    options: [
        {
            name: "channel", description: "Channel for sending event messages.",
            type: 7, required: true
        },
    ],
    run
}
