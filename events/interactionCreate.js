const { InteractionType, MessageFlags } = require('discord.js');
const { owners } = require('../config');

module.exports = {
    name: "interactionCreate",
    run: async (bot, interaction) => {

        // -----------------------------
        // SLASH COMMANDS
        // -----------------------------
        if (interaction.isChatInputCommand()) {

            if (!interaction.inGuild()) {
                return interaction.reply({
                    content: "This command can only be used in a server",
                    flags: MessageFlags.Ephemeral
                });
            }

            const slashcmd = bot.slashcommands.get(interaction.commandName);

            if (!slashcmd) {
                return interaction.reply({
                    content: "Invalid Slash Command",
                    flags: MessageFlags.Ephemeral
                });
            }

            if (slashcmd.perm &&
                !interaction.member.permissions.has(slashcmd.perm)) {
                return interaction.reply({
                    content: "You do not have permission for this command",
                    flags: MessageFlags.Ephemeral
                });
            }

            if (slashcmd.devOnly &&
                !owners.includes(interaction.member.id)) {
                return interaction.reply({
                    content: "Dev only command",
                    flags: MessageFlags.Ephemeral
                });
            }

            try {
                await slashcmd.run(bot, interaction);
            } catch (err) {
                console.log("Slash command error:", err);
            }
        }

        // -----------------------------
        // BUTTONS (removed role logic)
        // -----------------------------
        if (interaction.isButton()) {
            // If your GMod buttons exist, they should be handled elsewhere
            return;
        }

        // -----------------------------
        // CONTEXT MENU
        // -----------------------------
        if (interaction.isUserContextMenuCommand()) {
            try {
                if (!interaction.inGuild()) {
                    return interaction.reply({
                        content: "Server only",
                        flags: MessageFlags.Ephemeral
                    });
                }

                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                const command = bot.contextcommands.get(interaction.commandName);

                if (command) {
                    await command.run(bot, interaction);
                }

            } catch (e) {
                console.log("Context error:", e);
            }
        }

        // -----------------------------
        // MODALS (FIXED)
        // -----------------------------
        if (interaction.type === InteractionType.ModalSubmit) {

            if (!interaction.inGuild()) {
                return interaction.reply({
                    content: "This can only be used in a server",
                    flags: MessageFlags.Ephemeral
                });
            }

            const modal = bot.modals.get(interaction.customId);

            if (!modal) {
                return interaction.reply({
                    content: "Unknown modal.",
                    flags: MessageFlags.Ephemeral
                });
            }

            try {
                await modal.run(bot, interaction);
            } catch (e) {
                console.log("Modal error:", e);

                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "Modal failed.",
                        flags: MessageFlags.Ephemeral
                    }).catch(() => {});
                }
            }
        }
    }
};