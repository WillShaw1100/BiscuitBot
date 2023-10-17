const { Channel, Message, EmbedBuilder } = require("discord.js")
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
        const embed = new EmbedBuilder()
          .setAuthor({name: person.user.tag, iconURL: person.user.avatarURL({ dynamic: true })}) //This will show the users tag and avatar - there was no need to stringify that text :P
          .setColor("Purple")
          .addFields([
            {name: `${person.user.tag}`, value: `${person}` },
            {name: 'ID:', value: `${person.id}` },
            {name: 'Nickname:', value: `${person.nickname ? `${person.nickname}` : 'None'}` },
            {name: 'Status:', value: userStatus },
            {name: 'Game:', value: userGame },
            {name: 'Joined The Server On:', value: `${moment(person.joinedAt).format('DD-MM-YYYY')}` },
            {name: 'Account Created On:', value: `${moment(person.user.createdAt).format('DD-MM-YYYY')}` },
            {name: 'Roles:', value: info.roles.cache ? info.roles.cache.map(roles => `${roles}`).join(', ') : "None" }
          ])
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
        return interaction.reply({
            content:'Failed to perform this command',
            ephemeral: true
        })
    }

}
}

module.exports = {
    name: "whois",
    type: 1,
    category: 'General',
    description: "User Stats",
    perm: "",
    minArgs: 1,
    expectedArgs: '<person>',
    options: [
        {
            name: "person", description: "Whos stats to view.",
            type: 6, required: true
        }
    ],
    run
}