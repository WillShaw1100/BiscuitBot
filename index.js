const Discord = require("discord.js");
const express = require('express');
const fs = require('fs');
const os = require("os");
const logs = require("discord-logs");
//const packageJSON = require("./package.json");
require('dotenv').config();

const app = express();

const client = new Discord.Client({ 
    intents: 3276799,//[Object.keys(Discord.GatewayIntentBits)],
    partials: [Object.keys(Discord.Partials)],
});

app.enable("trust proxy") //if the ip is ::1 it means localhost
app.set("etag", false) //disable cache
app.use(express.static(__dirname + "/website"))

let bot = {
    client,
    prefix: process.env.PREFIX,
    owners: ["206068051295076352"]
}
client.commands = new Discord.Collection()
client.events = new Discord.Collection()
client.slashcommands = new Discord.Collection()
//client.logs = new Discord.Collection()

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload)
client.loadCommands = (bot, reload) => require("./handlers/commands")(bot, reload)
client.loadSlashCommands= (bot, reload) => require("./handlers/slashcommands")(bot, reload)
client.loadLogs = (bot, reload) => require("./handlers/handleLogs")(bot, reload);


client.loadEvents(bot, false)
client.loadCommands(bot, false)
client.loadSlashCommands(bot, false)
client.loadLogs(bot, false)

client.on("interactionCreate", async (interaction) => {
    const {client} = bot
    if(interaction.isCommand()) {
    if(!interaction.inGuild()) return interaction.reply("This Command can only be used in a server")

    const slashcmd = client.slashcommands.get(interaction.commandName)

    if(!slashcmd) return interaction.reply("Invalid Slash Command")

    if(slashcmd.perm && !interaction.member.permissions.has(slashcmd.perm))
        return interaction.reply("You do not have permission for this command")

   // slashcmd.run(client, interaction)
    

    
	if (!interaction.inGuild()) return interaction.reply("This command can only be used in a guild")

	//const slashcmd = client.slashcommands.get(interaction.commandName)

	if (!slashcmd) return

	// check permissions
	if (slashcmd.perms && !interaction.member.permissions.has(slashcmd.perms))
		return interaction.reply("You do not have permission to use this command")

	slashcmd.run(client, interaction)
}

//Role menu
if(interaction.isStringSelectMenu()){
	const {client} = bot
	if(!interaction.inGuild()) return interaction.reply("This command can only be used in a guild")
	if (!interaction.isStringSelectMenu() || interaction.customId !== 'auto_roles') {
		return
	}
	try{
	
    
    //let guild = await client.guilds.fetch(interaction.guild_id)
    //let member = guild.members.cache.get(interaction.member.user.id);

    const roleId = interaction.values[0];
    const role = interaction.guild.roles.cache.get(roleId);
    const memberRoles = interaction.member.roles;
	const hasRole = memberRoles.cache.has(roleId)

    const channel = (interaction.channelId)
    const targetMessage = await interaction.channel.messages.fetch('951292161394081812', {
        cache: true,
        force: true
    })
    if(roleId == null)return
    else if(hasRole){
        memberRoles.remove(roleId);
        targetMessage.edit("Please Select Your Role, Only Select **ONE** at a time")
        interaction.reply({
            content: `${role} has been removed`,
            ephemeral: true,
            defer: true
        })
	}else{
        memberRoles.add(roleId)
        targetMessage.edit("Please Select Your Role, Only Select **ONE** at a time")
        interaction.reply({
            content: `${role} has been added`,
            ephemeral: true,
            defer: true
        })
    }

}catch(err){
	if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }
}
}
})



module.exports = bot

// const version = packageJSON.version;

/////////////////////////////////////////////////////////

//dashboard:

//Logs ip and site visit
app.use((req, res, next) => {
    console.log(`-${req.method}: ${req.url} ${res.statusCode} ( by: ${req.ip})`)
    next()
})



app.get("/", async (req, res) => {

    const ram = os.totalmem() / 1000
    const cores = os.cpus().length
    const cpuModel = os.cpus()[0].model


    let file = fs.readFileSync("./dashboard/html/index.html", {encoding: "utf8"})
    file = file.replace("$$ram$$", ram)
    file = file.replace("$$cores$$", cores)
    file = file.replace("$$cpu$$", cpuModel)
    
    res.send(file)
    //res.sendFile('./dashboard/html/index.html', { root: __dirname })
})

app.get("/suggestions.html", async (req, res) => {

    res.sendFile('./dashboard/html/suggestions.html', { root: __dirname })
})
app.get("/stats.html", async (req, res) => {


    const guilds = client.guilds.cache.size
    const users = client.users.cache.size
    const channels = client.channels.cache.size


    let file = fs.readFileSync("./dashboard/html/stats.html", {encoding: "utf8"})

    file = file.replace("$$guilds$$", guilds)
    file = file.replace("$$users$$", users)
    file = file.replace("$$channels$$", channels)
    
    res.send(file)

    //res.sendFile('./dashboard/html/stats.html', { root: __dirname })
})

logs(client, {
    debug: true
});

client.login(process.env.TEST_DISCORD_TOKEN);//process.env.TEST_BOT_TOKEN);DISCORD_TOKEN
app.listen(process.env.PORT || 8080, () => console.log(`Listening on Port ${process.env.PORT || 8080}`));
