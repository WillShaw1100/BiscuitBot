const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
    name: "ready",
    run: async (bot) => {
        await mongoose.connect(process.env.MONGODB || '', {
            keepAlive: true,
        });
        if (mongoose.connect) {
            console.log("MongoDB connection succesful.")
        }
        bot.client.user.setPresence({ activities: [{ name: `Serving ${bot.client.guilds.cache.size} servers` }], status: 'online' });
        console.log("Logged in as " + bot.client.user.tag + "\nServing " + bot.client.guilds.cache.size +" Servers")
    }
}