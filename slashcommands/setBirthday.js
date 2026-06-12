const birthdaySchema = require("../models/birthdaySchema");

const run = async (client, interaction) => {
    try {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const date = new Date(interaction.options.getString('date'));

        if (!guildId) {
            return interaction.reply({
                content: 'Guild ID not found',
                flags: MessageFlags.Ephemeral
            });
        }

        if (userId) {
            await birthdaySchema.findOneAndUpdate(
                { Guild: guildId, Member: userId },
                { Date: date },
                { upsert: true }
            );

            interaction.reply({
                content: `Your birthday has been set to ${date.toDateString()}.`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            interaction.reply({
                content: `Something went wrong.`,
                flags: MessageFlags.Ephemeral
            });
        }

    } catch (err) {
        console.error(err);
        return interaction.reply({
            content: 'Failed to perform this command.',
            flags: MessageFlags.Ephemeral,
        });
    }
};

module.exports = {
    name: "setbirthday",
    type: 1,
    category: 'General',
    description: "Set your birthday (WIP)",
    perm: "",
    devOnly: true,
    options: [
        {
            name: 'date',
            type: 3,
            description: 'Your birthday (YYYY-MM-DD)',
            required: true,
        },
    ],
    run
};
