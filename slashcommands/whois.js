const { Channel, Message, MessageEmbed } = require("discord.js")
const moment = require('moment');

const run = async (client, interaction) => {
    const person = (interaction.options.getMember('person'))

    if(!person)
        return interaction.reply('Please tag a person')
    try{

        const memberemb = interaction.guild.members.fetch(person);
        Promise.resolve(memberemb).then(function (info) {

            if(!person.presence){
                userStatus = "offline"
                userGame = "None"
            }else{
                userStatus = person.presence.status
                userGame = `${person.presence.game ? person.presence.game.name : 'None'}`
            }
       // const status = person.presence.status;

        //const joined = person.joinedAt;
        //const roles = person.roles.map(r => `${r}`).join(' | '), true)
        // User variables
    //const created= "PlaceHolder"
        const embed = new MessageEmbed()
          .setAuthor({name: person.user.tag, iconURL: person.user.avatarURL({ dynamic: true })}) //This will show the users tag and avatar - there was no need to stringify that text :P
          .setColor("RANDOM")
          .addField(`${person.user.tag}`, `${person}`, true)
          .addField("ID:", `${person.id}`, true)
          .addField("Nickname:", `${person.nickname ? `${person.nickname}` : 'None'}`, true)
          .addField("Status:", userStatus, true)
          // always shows offline in status
          .addField("Game:", userGame, true)
          //idk if it shows games correctly
          .addField("Joined The Server On:", `${moment(person.joinedAt).format('DD-MM-YYYY')}`, true)
          .addField("Account Created On:", `${moment(person.user.createdAt).format('DD-MM-YYYY')}`, true)
          .addField("Roles:", info.roles.cache ? info.roles.cache.map(roles => `${roles}`).join(', ') : "None", true)

          .setTimestamp(); //Timestamp the footer
       // if (person.presence.game) embed.addField('⠀', `**> Currently playing:** ${person.presence.game.name}`);


       interaction.channel.send({ embeds: [embed] });
        interaction.reply({
            content: `Heres the user stats for ${person}`,
            ephemeral: true
        })
    });
    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }

}
}

module.exports = {
    name: "whois",
    category: 'General',
    description: "User Stats",
    perm: "",
    minArgs: 1,
    expectedArgs: '<person>',
    options: [
        {
            name: "person", description: "Whos stats to view.",
            type: "USER", required: true
        }
    ],
    run
}