const { 
    Client, 
    Message, 
    Channel, 
    MessageEmbed, 
    MessageActionRow, 
    MessageSelectMenu 
} = require("discord.js")
const { readdirSync } = require("fs");


const run = async (client, interaction) => {
    try{
        const emojis = {
            configuration: '⚙️',
            staff: '🛠️',
            general: '👋',
            fun: '🎈'

        }
        const directories = [...new Set(client.slashcommands.map(cmd => cmd.category)),
        ];
        //console.log(directories)
        const formatString = (str) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

        const categories = directories.map((dir) => {
            const getCommands = client.slashcommands.filter((cmd) => cmd.category === dir
            ).map((cmd) =>{
                return {
                    name: cmd.name || 'Command is not ready',
                    description: cmd.description || 'There is no description for this command.',
                };
            });

        return {
            directory: formatString(dir),
            commands: getCommands,
        };
        });

        const embed = new MessageEmbed().setDescription(
            "Please choose a category in the dropdown menu"
        );
        
        const components = (state) => [
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                .setCustomId("help-menu")
                .setPlaceholder("Please select a category")
                .setDisabled(state)
                .addOptions(
                    categories.map((cmd) => {
                        return {
                            label: cmd.directory,
                            value: cmd.directory.toLowerCase(),
                            description: `Commands from the ${cmd.directory} category`,
                            emoji: emojis[cmd.directory.toLowerCase()] || null,
                        };
                    })
                )
            ),
        ];
        const initialMessage = await interaction.reply({
            embeds: [embed],
            components: components(false),
        });

        const filter = (interaction) => interaction.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector( { 
            filter, 
            componentType: 'SELECT_MENU', 
            //time: 5000,
     });
     collector.on('collect', (interaction) => {
         const [ directory ] = interaction.values;
         const specificCategory = categories.find(
             x => x.directory.toLowerCase() === directory
        );
        const categoryEmbed = new MessageEmbed()
        .setTitle(`${formatString(directory)} Commands`)
        .setDescription("Here is the list of commands")
        .addFields(
            specificCategory.commands.map((cmd) => {
                return {
                    name: `\`${cmd.name}\``,
                    value: `${cmd.description}`,
                    inline: true,
                };
            })
        );
        interaction.update( { embeds: [categoryEmbed] })
     });

     collector.on("end", () => {
         initialMessage.edit({ components: components(true) });
     });
    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }

}
}

module.exports = {
    name: "help",
    category: 'General',
    description: "List the commands",
    perm: "",
    run
}