const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");

const client = new Client({
    intents: 3276799,
    partials: Object.values(Partials),
});

// Collections
client.slashcommands = new Collection();
client.modals = new Collection();
client.contextcommands = new Collection();
client.commands = new Collection();
client.events = new Collection();
client.logs = new Collection();

module.exports = client;