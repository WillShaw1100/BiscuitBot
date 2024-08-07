const Discord = require("discord.js");
const express = require('express');
const fs = require('fs');
const os = require("os");
const logs = require("discord-logs");
const slashcommands = require("./handlers/slashcommands");
require('dotenv').config();
const config = require('./config');

const client = new Discord.Client({
    intents: 3276799,//[Object.keys(Discord.GatewayIntentBits)],
    partials: [Object.keys(Discord.Partials)],
});

let bot = {
    client,
    prefix: config.prefix,
    owners: config.owners
}
client.slashcommands = new Discord.Collection();
client.modals = new Discord.Collection();
client.contextcommands = new Discord.Collection();
client.commands = new Discord.Collection()
client.events = new Discord.Collection()
client.logs = new Discord.Collection()

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

module.exports = {
    slashcommands: slashcommands,
    bot: bot,
};
//Role menu
/*if(interaction.isStringSelectMenu()){
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
})*/


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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


client.login(process.env.NODE_ENV === 'dev' ? process.env.TEST_DISCORD_TOKEN : process.env.DISCORD_TOKEN);