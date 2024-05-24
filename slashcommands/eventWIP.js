const { Channel, Message, PermissionsBitField, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")

const run = async (client, interaction) => {
    try {

        const modal = new ModalBuilder()
            .setCustomId('event')
            .setTitle('Event Creator');

        const eventNameInput = new TextInputBuilder()
            .setCustomId("eventNameInput")
            .setLabel('Event Name')
            .setMinLength(3)
            .setMaxLength(99)
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const eventStartDateInput = new TextInputBuilder()
            .setCustomId("eventStartDateInput")
            .setLabel('Start Date')
            .setMinLength(10)
            .setMaxLength(10)
            .setPlaceholder('dd/mm/yyyy')
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const eventStartTimeInput = new TextInputBuilder()
            .setCustomId("eventStartTimeInput")
            .setLabel('Start Time')
            .setMinLength(5)
            .setMaxLength(5)
            .setPlaceholder('hh:mm')
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const eventDescriptionInput = new TextInputBuilder()
            .setCustomId("eventDescriptionInput")
            .setLabel('Event Description')
            .setMinLength(10)
            .setMaxLength(600)
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        const eventRequirementsInput = new TextInputBuilder()
            .setCustomId("eventRequirementsInput")
            .setLabel('Event Requirements')
            .setMinLength(0)
            .setMaxLength(150)
            .setPlaceholder("Garry's Mod, TTT Modpack, CSS or Game content (see #gmod )")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(new ActionRowBuilder().addComponents(eventNameInput));
        modal.addComponents(new ActionRowBuilder().addComponents(eventStartDateInput));
        modal.addComponents(new ActionRowBuilder().addComponents(eventStartTimeInput));
        modal.addComponents(new ActionRowBuilder().addComponents(eventDescriptionInput));
        modal.addComponents(new ActionRowBuilder().addComponents(eventRequirementsInput));


        await interaction.showModal(modal);


    } catch (err) {
        if (err) {
            console.error(err)
            return interaction.reply({
                content: 'Failed to perform this command',
                ephemeral: true
            })
        }

    }
}

module.exports = {
    name: "eventwip",
    type: 1,
    category: 'Events',
    description: "Create an Event",
    perm: PermissionsBitField.Flags.ManageEvents,
    devOnly: true,
    expectedArgs: '<channel> <role> <notifychannel>',
    options: [
        {
            "type": 7,
            "name": "vc",
            "description": "relevent voice channel",
            "channel_types": [2],
            "required": true
        },
        {
            "type": 8,
            "name": "role",
            "description": "role to notfiy",
            "required": false
        },
        {
            "type": 7,
            "name": "notifychannel",
            "description": "Send a notifcation to a channel",
            "channel_types": [0, 5],
            "required": false
        },
    ],
    run
}