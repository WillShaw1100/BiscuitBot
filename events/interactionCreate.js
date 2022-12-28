/* module.exports = {
	name: "interactionCreate",
	run: async (bot, interaction) => {
		if (interaction.isCommand()) handleSlashCommand(bot, interaction)
		else if (interaction.isButton()) handleButton(bot, interaction)
		else if (interaction.isStringSelectMenu()) return console.log(interaction) //handleSelectMenu(bot, interaction)
	},
}

const handleButton = (bot, interaction) => {
	const {client} = bot 

	// "name-param1-param2-...."
	const [name, ...params] = interaction.customId.split("-")
	
	const button = client.buttons.get(name)

	if (!button) return 
	button.run(client, interaction, params)
}

const handleSlashCommand = (bot, interaction) => {
	const {client} = bot
	if (!interaction.inGuild()) return interaction.reply("This command can only be used in a guild")

	const slashcmd = client.slashcommands.get(interaction.commandName)

	if (!slashcmd) return

	// check permissions
	if (slashcmd.perms && !interaction.member.permissions.has(slashcmd.perms))
		return interaction.reply("You do not have permission to use this command")

	slashcmd.run(client, interaction)
}

const handleSelectMenu = (bot,interaction) => {
	const {client} = bot
	if(!interaction.inGuild()) return interaction.reply("This command can only be used in a guild")
	if (!interaction.isStringSelectMenu() || interaction.customId !== 'auto_roles') {
		return
	}
	try{
	interaction.deferReply({ephermal: true})
	const roleId = interaction.values[0];
	const role = interaction.guild.cache.get(roleId)
	const memberRoles = interaction.member.roles;

	const hasRole = memberRoles.cache.has(roleId)

	if(hasRole){
		memberRoles.remove(roleId);
		interaction.followup(`${role.name} has been removed`)
	}else {
		memberRoles.add(roleId)
		interaction.followup(`${role.name} has been added`)
	}
}catch(err){
	if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }
}
}

 */