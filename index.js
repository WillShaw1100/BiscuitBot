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
client.slashcommands = new Discord.Collection()

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload)
client.loadCommands = (bot, reload) => require("./handlers/commands")(bot, reload)
client.loadSlashCommands= (bot, reload) => require("./handlers/slashcommands")(bot, reload)


client.loadEvents(bot, false)
client.loadCommands(bot, false)
client.loadSlashCommands(bot, false)

client.on("interactionCreate", (interaction) => {
    if(!interaction.isCommand()) return
    if(!interaction.inGuild()) return interaction.reply("This Command can only be used in a server")

    const slashcmd = client.slashcommands.get(interaction.commandName)

    if(!slashcmd) return interaction.reply("Invalid Slash Command")

    if(slashcmd.perm && !interaction.member.permissions.has(slashcmd.perm))
        return interaction.reply("You do not have permission for this command")

    slashcmd.run(client, interaction)
})

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