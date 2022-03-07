const Discord = require('discord.js');
const packageJSON = require("./package.json");
const generateImage = require("./generateImage")

require('dotenv').config();

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"] });
const version = packageJSON.version;

/* Channel IDs ****************************************************/
const welcomeChannelId = "551771197042458635"

/*************************************************************** */
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on("guildMemberAdd", async (member) => {
    const img = await generateImage(member)
    member.guild.channels.cache.get(welcomeChannelId).send({
        content: `<@${member.id}> Welcome to the server!`,
        files: [img]
    })
})




client.login(process.env.DISCORD_TOKEN);