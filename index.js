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
client.commands = new Discord.Collection()
client.events = new Discord.Collection()

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload)
client.loadCommands = (bot, reload) => require("./handlers/commands")(bot, reload)

client.loadEvents(bot, false)
client.loadCommands(bot, false)

module.exports = bot

/* const version = packageJSON.version;

 Channel IDs ****************************************************/
const welcomeChannelId = "551771197042458635"

/*************************************************************** 


client.on("guildMemberAdd", async (member) => {
    const img = await generateImage(member)
    member.guild.channels.cache.get(welcomeChannelId).send({
        content: `<@${member.id}> Welcome to the server!`,
        files: [img]
    })
})
 */




client.login(process.env.DISCORD_TOKEN);