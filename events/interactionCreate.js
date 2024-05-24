const { InteractionType } = require('discord.js');
const { handleModalSubmit } = require('../handlers/modalHandler');

module.exports = {
	name: "interactionCreate",
	run: async (bot, interaction) => {

		if (interaction.isCommand()) {
			if (!interaction.inGuild()) return interaction.reply("This Command can only be used in a server")
			const slashcmd = bot.slashcommands.get(interaction.commandName)

			if (!slashcmd) return interaction.reply("Invalid Slash Command")

			if (slashcmd.perm && !interaction.member.permissions.has(slashcmd.perm))
				return interaction.reply({ content: "You do not have permission for this command", ephemeral: true })




			if (!interaction.inGuild()) return interaction.reply("This command can only be used in a guild")


			if (!slashcmd) return

			// check permissions
			if (slashcmd.perms && !interaction.member.permissions.has(slashcmd.perms))
				return interaction.reply({ content: "You do not have permission for this command", ephemeral: true })

			slashcmd.run(bot, interaction)
		}
		if (interaction.isButton()) {
			try {
				if (!interaction.inGuild()) return interaction.reply("This can only be used in a server")
				await interaction.deferReply({ ephemeral: true });
				const role = interaction.guild.roles.cache.get(interaction.customId);
				if (!role) {
					interaction.editReply('No role found.')
					return;
				}

				const hasRole = interaction.member.roles.cache.has(role.id);
				if (hasRole) {
					await interaction.member.roles.remove(role);
					await interaction.editReply(`The role ${role} has been removed`);
					return;
				}
				await interaction.member.roles.add(role);
				await interaction.editReply(`The role ${role} has been added`);
			} catch (e) {
				console.log(e);
			}
		}
		if (interaction.isUserContextMenuCommand()) {
			try {
				if (!interaction.inGuild()) return interaction.reply("This can only be used in a server");
				await interaction.deferReply({ ephemeral: true });
				const command = bot.contextcommands.get(interaction.commandName);
				if (command) command.run(bot, interaction);

				//const userId = interaction.targetId;
				//const channelId = interaction.channelId;

				//await interaction.reply('Context menu command executed!');
			} catch (e) {
				console.log(e);
			}
		}

		if (interaction.type == InteractionType.ModalSubmit) {

			if (!interaction.inGuild()) return interaction.reply("This can only be used in a server");
			//await interaction.deferReply({ ephemeral: true });
			const { modals } = bot;
			const { customId } = interaction;
			const modal = modals.get(customId);
			//console.log(modal);
			//console.log(modals);

			if (!modal) {
				console.error("There is no code for this modal.");
				return interaction.editReply("There is no code for this modal.");
			}

			try {
				modal.run(bot, interaction)
				//modal.run(bot, interaction)
				//handleModalSubmit(interaction)

			} catch (e) {
				console.error(e);
			}
		}


	}
}