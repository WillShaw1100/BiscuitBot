const axios = require("axios");
const gmodSchema = require("../models/gmodSchema");
require('dotenv').config();

const run = async (client, interaction) => {
    try {

        // Set your SheetDB API Bearer Token
        const bearerToken = process.env.GMOD_TOKEN;

        // Axios configuration with Bearer Token
        const axiosConfig = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        };


        // Fetch data from SheetDB API for season 2
        const response = await axios.get(process.env.GMOD, axiosConfig);
        const playersData = response.data;

        // Assuming Season is set to 2 (you can modify according to your schema)
        const season = 2;

        // Loop through each player data and save to MongoDB
        for (const playerData of playersData) {
            const { ID, Player, ...games } = playerData;

            // Loop through games object to extract round scores
            Object.keys(games).forEach(key => {
                if (key.startsWith('Game')) {
                    const roundNumber = parseInt(key.replace('Game', ''));
                    const score = parseInt(games[key]) || 0;

                    // Check if a record already exists with the same ID, season, and round
                    gmodSchema.findOneAndUpdate(
                        { ID: ID, Season: season, Round: roundNumber },
                        {
                            Guild: interaction.guild.id.toString(),
                            Member: Player,
                            TraitorWins: score
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    )
                        .then(updatedRecord => {
                            if (updatedRecord) {
                                console.log(`Record updated for ${Player}, Round ${roundNumber}`);
                            } else {
                                console.log(`New record created for ${Player}, Round ${roundNumber}`);
                            }
                        })
                        .catch(err => {
                            console.error(`Error updating or inserting record for ${Player}, Round ${roundNumber}:`, err);
                        });
                }
            });
        }

        interaction.reply({
            content: 'Scores updated for all players.',
            ephemeral: true
        });

    } catch (err) {
        console.error('Error fetching or storing data:', err);
        interaction.reply({
            content: 'Failed to perform this command.',
            ephemeral: true
        });
    }
};

module.exports = {
    name: "addgmodscore",
    type: 1,
    category: 'Games',
    description: "Add GMod scores from season 2 spreadsheet to the database",
    perm: "",
    devOnly: true,
    expectedArgs: '',
    options: [],
    run
};
