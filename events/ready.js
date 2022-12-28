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
        console.log("Logged in as " + bot.client.user.tag)
    }
}