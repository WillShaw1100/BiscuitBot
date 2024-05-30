const birthdaySchema = require("../models/birthdaySchema");
const { category } = require("./setBirthday");

const run = async (client, interaction) => {
    try {
        const userId = interaction.options.getUser('user').id;
        const guildId = interaction.guild.id;

        const guild = await client.guilds.fetch(guildId);
        if (!guild) return console.log('Guild not found');

        birthdaySchema.findOne({ Guild: guildId, Member: userId }, async (err, data) => {
            if (!data || data.length === 0) {
                return interaction.reply({
                    content: 'This user has not set a birthday',
                    ephemeral: true
                });
            } else {
                const today = new Date();
                const userBirthday = new Date(data.Date);
                const userBirthdayThisYear = new Date(today.getFullYear(), userBirthday.getMonth(), userBirthday.getDate());
                const birthdayDate = userBirthday.toDateString();

                if (userBirthdayThisYear.toDateString() === today.toDateString()) {
                    interaction.reply(`Happy birthday, ${interaction.options.getUser('user').tag}! 🎉`);
                } else {
                    const formattedBirthday = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(userBirthday);
                    interaction.reply(`${interaction.options.getUser('user').tag}'s birthday is on ${formattedBirthday}.`);
                }
            }
        });
    } catch (err) {
        console.error(err);
        return interaction.reply({
            content: 'Failed to retrieve the birthday.',
            ephemeral: true,
        });
    }
};

module.exports = {
    name: "getbirthday",
    description: "Get a member's birthday (WIP)",
    category: 'General',
    options: [
        {
            name: 'user',
            type: 6,
            description: 'The user whose birthday you want to know',
            required: true,
        },
    ],
    run,
};
