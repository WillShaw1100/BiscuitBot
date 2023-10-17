const { Channel, Message, EmbedBuilder, ChannelType, SlashCommandBuilder, PermissionsBitField } = require("discord.js")
const welcomeSchema = require("../models/welcomeSchema");

const run = async (client, interaction) => {
    const { channel, guildId, options } = interaction;
    const welcomeChannel = (interaction.options.getChannel('channel'))
    const welcomeMessage = (interaction.options.getString('welcome-message'))
    const RoleId = (interaction.options.getRole('welcome-role'))

    const setupWelcomeEmbed = new EmbedBuilder()

    try{
        welcomeSchema.findOne({ Guild: guildId}, async (err, data) => {
            if(RoleId == guildId) return interaction.reply({ content: "The role cannot be `@everyone`", ephemeral: true });
            if (!data) {
                await welcomeSchema.create({
                    Guild: guildId,
                    Channel: welcomeChannel.id,
                    Msg: welcomeMessage,
                    Role: RoleId.id
                });

                setupWelcomeEmbed.setDescription("Data was succesfully sent to the database.")
                .setColor("Green")
                .setTimestamp();
            } else if (data) {
                await welcomeSchema.deleteOne({ Guild: guildId });
                await welcomeSchema.create({
                    Guild: guildId,
                    Channel: welcomeChannel.id,
                    Msg: welcomeMessage,
                    Role: RoleId.id
                    });
    
                    setupWelcomeEmbed.setDescription("Old data was succesfully replaced with the new data.")
                    .setColor("Green")
                    .setTimestamp();
            }
            if (err) {
                console.log(err)
                setupWelcomeEmbed.setDescription("Something went wrong. Please contact the developers.")
                .setColor("Red")
                .setTimestamp();
            }
            return interaction.reply({ embeds: [setupWelcomeEmbed], ephemeral: true });
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
    name: "setup-welcome",
    type: 1,
    category: 'Configuration',
    description: "Set up your welcome channel for the welcoming members.",
    perm: PermissionsBitField.Flags.Administrator,
    minArgs: 3,
    expectedArgs: '<channel> <welcome-message> <welcome-role>',
    options: [
        {
            name: "channel", description: "Channel for sending welcome messages",
            type: 7, required: true
        },
        {
            name: "welcome-message", description: "Enter your welcome message",
            type: 3, required: true
        },
        {
            name: "welcome-role", description: "Enter your welcome role",
            type: 8, required: true
        },
    ],
    run
}