const mongoose = require('mongoose');
const { ActivityType } = require('discord.js');
require('dotenv').config();
mongoose.set('strictQuery', true);

module.exports = {
    name: "ready",
    run: async (bot) => {
        const options = [
            {
                type: ActivityType.Watching,
                text: "over Biscuit Mafia",
                status: "online"
            },
            {
                type: ActivityType.Listening,
                text: "commands",
                status: "online"
            },
            {
                type: ActivityType.Playing,
                text: "TTT",
                status: "online"
            },
            {
                type: ActivityType.Playing,
                text: "with Max's emotions",
                status: "online"
            },
            {
                type: ActivityType.Playing,
                text: "PULSAR: Lost Colony",
                status: "online"
            }
        ];

        // Connect to MongoDB
        try {
            await mongoose.connect(process.env.MONGODB || '', {
                keepAlive: true,
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log("MongoDB connection successful.");
        } catch (error) {
            console.error("MongoDB connection error:", error);
        }

        // Function to set a random presence
        const setRandomPresence = async () => {
            const optionSelect = Math.floor(Math.random() * options.length);
            try {
                await bot.client.user.setPresence({
                    activities: [{
                        name: options[optionSelect].text,
                        type: options[optionSelect].type
                    }],
                    status: options[optionSelect].status
                });
                //console.log(`Presence set to: ${options[optionSelect].text}`);
            } catch (error) {
                console.error("Error setting presence:", error);
            }
        };

        // Set the initial presence
        setRandomPresence();

        // Change the presence every 10 seconds
        setInterval(setRandomPresence, 10 * 1000);

        console.log("Logged in as " + bot.client.user.tag + "\nServing " + bot.client.guilds.cache.size + " Servers");
    }
};
