const { PermissionsBitField } = require("discord.js");

const EXEMPT_USER_IDS = ['416673750965026817', '475462382089535498', '206068051295076352', '163506050249523201']; //max, marcus, will, bandit

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

        // Mute all members in the voice channel except those exempted
        for (const [memberID, member] of voiceChannel.members) {
            if (!EXEMPT_USER_IDS.includes(memberID) && !member.user.bot) {
                await member.voice.setMute(true);
                //await interaction.followUp(`${member.displayName} has been muted.`);
            }
        }

        return interaction.editReply('All members except exempted ones have been muted.');
    } catch (err) {
        console.error(err);
        return interaction.editReply({
            content: 'Failed to perform this command',
            ephemeral: true
        });
    }
};

module.exports = {
    name: "vcmute",
    type: 1,
    category: 'Moderation',
    description: "Mute all members in the VC except those exempt",
    perm: PermissionsBitField.Flags.Administrator,
    run
};