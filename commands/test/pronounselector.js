const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js")

module.exports = {
    name: "pronounselector",
    category: "test",
    devOnly: true,
    run: async ({client, message, args}) => {
        message.channel.send({
            embeds: [
                new MessageEmbed().setTitle("Select Pronoun Role").setDescription("Select roles from the buttons below").setColor("PURPLE")
            ],
            components: [
                new MessageActionRow().addComponents([
                    new MessageButton().setCustomId("role-847809820206694450").setStyle("PRIMARY").setLabel("He/him"),
                    new MessageButton().setCustomId("role-847809759507251220").setStyle("PRIMARY").setLabel("She/Her"),
                    new MessageButton().setCustomId("role-847809869922566214").setStyle("PRIMARY").setLabel("They/Them"),
                    new MessageButton().setCustomId("role-847809916278013993").setStyle("PRIMARY").setLabel("Ask Me")
                ])
            ]
        })
    }
}