const express = require('express');
const fs = require('fs');
const os = require("os");
const logs = require("discord-logs");
const slashcommands = require("./handlers/slashcommands");
require('dotenv').config();
const config = require('./config');
const client = require('./core/client');

let bot = {
    client,
    prefix: config.prefix,
    owners: config.owners
}

client.loadCommands = (bot, reload) => require("./handlers/commands")(bot, reload)
client.loadSlashCommands = (bot, reload) => require("./handlers/slashcommands")(bot, reload)
client.loadContextCommands = (bot, reload) => require("./handlers/contextCommands")(bot, reload)
client.loadLogs = (bot, reload) => require("./handlers/handleLogs")(bot, reload)
client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload)
client.loadModals = (bot, reload) => require("./handlers/modalHandler")(bot, reload)

client.loadCommands(bot, false)
client.loadSlashCommands(bot, false)
client.loadContextCommands(bot, false)
client.loadLogs(bot, false)
client.loadEvents(bot, false)
client.loadModals(bot, false)

logs(client, {
    debug: true
});

//web
const app = express();

// Import web interface app
const webInterfaceApp = require('./web_interface/app.js');

app.use('/', webInterfaceApp);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});


client.login(process.env.NODE_ENV === 'dev' ? process.env.TEST_DISCORD_TOKEN : process.env.DISCORD_TOKEN);