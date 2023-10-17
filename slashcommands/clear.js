const { Channel, Message, PermissionsBitField, EmbedBuilder } = require("discord.js")

const run = async (client, interaction) => {
    const {channel, options} = interaction;

        const amount = options.getInteger('amount');
        const target = options.getUser("target");

        const messages = await channel.messages.fetch({
            limit: amount +1,
        });

        const res = new EmbedBuilder()
            .setColor(0x5fb041)
        
    try{
        if(target) {
            let i = 0;
            const filtered = [];

            (await messages).filter((msg) =>{
                if(msg.author.id === target.id && amount > i) {
                    filtered.push(msg);
                    i++;
                }
            });

            await channel.bulkDelete(filtered).then(messages => {
                res.setDescription(`Succesfully deleted ${messages.size} messages from ${target}.`);
                interaction.reply({embeds: [res]}); // you can use ephemeral if you desire
            });
        } else {
            await channel.bulkDelete(amount, true).then(messages => {
                res.setDescription(`Succesfully deleted ${messages.size} messages from the channel.`);
                interaction.reply({embeds: [res]});
            })
        }
    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply({
            content: 'Failed to perform this command',
            ephemeral: true
        })
    }

}
}

module.exports = {
    name: "clear",
    type: 1,
    category: "Staff",
    description: "Clear a specific amount of messages from a target or channel. (Slash Commands count)",
    perm: PermissionsBitField.Flags.ManageMessages,
    options: [
        {
            name: "amount", description: "Amount of messages to clear.",
            type: 4, required: true
        },
        {
            name: "target",
            description: "Select a target to clear their messages.",
            type: 6,
            required: false
        }
    ],
    run
}