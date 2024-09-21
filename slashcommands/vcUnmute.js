const { PermissionsBitField } = require("discord.js");

const run = async (client, interaction) => {
    try {
        const member = interaction.member;

        // Check if the member is in a voice channel
        if (!member.voice.channel) {
            return interaction.reply({
                content: 'You need to be in a voice channel to use this command.',
                ephemeral: true
            });
        }

        const voiceChannel = member.voice.channel;

        // Defer the reply to give us time to process the command
        await interaction.deferReply();

        // Unmute all members in the voice channel
        for (const [memberID, member] of voiceChannel.members) {
            if (!member.user.bot) {
                await member.voice.setMute(false);
                //await interaction.followUp(`${member.displayName} has been unmuted.`);
            }
        }

        return interaction.editReply('All members have been unmuted.');
    } catch (err) {
        console.error(err);
        return interaction.editReply({
            content: 'Failed to perform this command',
            ephemeral: true
        });
    }
};

module.exports = {
    name: "vcunmute",
    type: 1,
    category: 'Moderation',
    description: "Unmute all members in the VC",
    perm: PermissionsBitField.Flags.MuteMembers,
    run
};
