const { EmbedBuilder } = require("discord.js");
const gmodSchema = require("../models/gmodSchema");

const ITEMS_PER_PAGE = 10; // Adjust as needed

const run = async (client, interaction) => {
    try {
        const guildID = interaction.guild.id.toString();
        const memberID = interaction.options.getUser('user').id;

        const guild = await client.guilds.fetch(guildID);
        if (!guild) return console.log('Guild not found');

        const data = await gmodSchema.find({ Guild: guildID, ID: memberID });

        if (!data || data.length === 0) {
            return interaction.reply({
                content: 'No Garry\'s Mod stats found for this user.',
                ephemeral: true
            });
        }

        // Sort data by Round number
        data.sort((a, b) => a.Round - b.Round);

        // Calculate total number of pages
        const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

        // Get page number from interaction options or default to 1
        let pageNumber = interaction.options.getInteger('page') || 1;

        // Calculate start and end index for current page
        let startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
        let endIndex = Math.min(startIndex + ITEMS_PER_PAGE, data.length);

        // Prepare the embed with the data for the current page
        const embed = createEmbed(guild.members.cache.get(memberID).displayName, data, pageNumber, totalPages, startIndex, endIndex);

        // Send the initial embed
        const message = await interaction.reply({ embeds: [embed] });

    } catch (err) {
        console.error(err);
        interaction.reply({
            content: `Failed to perform this command. \n${err}`,
            ephemeral: true
        });
    }
};

// Function to create the embed for the current page
function createEmbed(displayName, data, pageNumber, totalPages, startIndex, endIndex) {
    const embed = new EmbedBuilder()
        .setTitle(`${displayName}'s Garry's Mod Stats (Page ${pageNumber}/${totalPages})`)
        .setColor('Blue')
        .setTimestamp();

    const fields = [];

    for (let i = startIndex; i < endIndex; i++) {
        const entry = data[i];
        const season = entry.Season;
        const round = entry.Round;
        const traitorWins = entry.TraitorWins;

        fields.push({
            name: `Season ${season} - Round ${round}`,
            value: `Traitor Wins: ${traitorWins}`,
            inline: false
        });
    }

    embed.addFields(fields);

    return embed;
}

module.exports = {
    name: "gmodscore",
    type: 1,
    category: 'Games',
    description: "View Garry's Mod Scores",
    perm: "",
    devOnly: true,
    expectedArgs: '[user: user] [page: integer]',
    options: [
        {
            name: 'user',
            type: 6, // USER
            description: 'Select user',
            required: true
        },
        {
            name: 'page',
            type: 4, // INTEGER
            description: 'Page number',
            required: false
        }
    ],
    run
};
