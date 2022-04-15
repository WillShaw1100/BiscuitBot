const Discord = require('discord.js');
//const packageJSON = require("./package.json");

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

if(interaction.isSelectMenu()){
	const {client} = bot
	if(!interaction.inGuild()) return interaction.reply("This command can only be used in a guild")
	if (!interaction.isSelectMenu() || interaction.customId !== 'auto_roles') {
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




client.login(process.env.DISCORD_TOKEN);