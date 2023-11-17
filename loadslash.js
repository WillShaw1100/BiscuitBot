const Discord = require('discord.js');
//const packageJSON = require("./package.json");

require('dotenv').config();

const client = new Discord.Client({ 
    intents: [Object.keys(Discord.GatewayIntentBits)],
    partials: [Object.keys(Discord.Partials)],
});

let bot = {
    client,
    prefix: process.env.PREFIX,
    owners: ["206068051295076352"]
}
const guildID = "470229266072731679" //Your Guild ID here

client.slashcommands = new Discord.Collection()


client.loadSlashCommands= (bot, reload) => require("./handlers/slashcommands")(bot, reload)
client.loadSlashCommands(bot, false)

//client.contextcommands = new Discord.Collection()


//client.loadContextCommands= (bot, reload) => require("./handlers/contextCommands")(bot, reload)
//client.loadContextCommands(bot, false)

client.on("ready", async () => {
    const guild = client.guilds.cache.get(guildID)
    if(!guild)
        return console.error("Target guild not found")

    await guild.commands.set([...client.slashcommands.values()])
    console.log(`Successfully loaded in ${client.slashcommands.size} slash commands`)

   // await guild.commands.set([...client.contextcommands.values()])
   // console.log(`Successfully loaded in ${client.contextcommands.size} context commands`)

   // console.log(([...client.slashcommands.values()]))

    process.exit(0)
})




client.login(process.env.NODE_ENV === 'dev' ? process.env.TEST_DISCORD_TOKEN : process.env.DISCORD_TOKEN);