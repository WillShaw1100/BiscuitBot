const Discord = require('discord.js');
//const packageJSON = require("./package.json");
const generateImage = require("./generateImage")

require('dotenv').config();

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"] });

let bot = {
    client,
    prefix: process.env.PREFIX,
    owners: ["206068051295076352"]
}
const guildID = "470229266072731679"

client.slashcommands = new Discord.Collection()


client.loadSlashCommands= (bot, reload) => require("./handlers/slashcommands")(bot, reload)
client.loadSlashCommands(bot, false)

client.on("ready", async () => {
    const guild = client.guilds.cache.get(guildID)
    if(!guild)
        return console.error("Target guild not found")

    await guild.commands.set([...client.slashcommands.values()])
    console.log(`Successfully loaded in ${client.slashcommands.size} slash commands`)
    process.exit(0)
})



client.login(process.env.DISCORD_TOKEN);