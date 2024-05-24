const { PermissionsBitField, EmbedBuilder, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require("discord.js");
const moment = require('moment');
const xpSchema = require("../models/xpSchema");
const generateRankImage = require("../assets/generateRankCard");
const { devOnly } = require("./eventWIP");

const run = async (client, interaction) => {
  const rankUser = interaction.options.getUser('user')


  try {

    const guildID = interaction.guild.id.toString()
    const guild = await client.guilds.fetch(guildID);
    const memberID = rankUser ? rankUser.id : interaction.member.user.id

    if (!guild)
      return console.log('Guild not found');

    //get_XP
    xpSchema.findOne({ Guild: guildID, Member: memberID }, async (err, data) => {
      if (!data) {
        interaction.reply("This user has sent no messages or something went wrong.");
      } else {
        let member = data.Member;
        let messages = data.Messages
        let xp = 0

        const img = await generateRankImage(member, messages, xp);
        console.log(img)
        if (img) {
          interaction.reply({
            content: `<@${member.id}> ${data.Msg}`,
            files: [img]
          });
        } else {
          interaction.reply({
            content: `Failed to generate rank card`,
            ephemeral: true
          });
        }
        //  interaction.reply(`The member ${member} has sent ${messages} messages`)
      }
    });


  } catch (err) {
    console.error(err);
    interaction.reply({
      content: `Failed to perform this command. \n${err}`,
      ephemeral: true
    });
  }
}

module.exports = {
  name: "rank",
  type: 1,
  category: 'General',
  description: "Shows the users current Ranking",
  perm: "",
  devOnly: true,
  expectedArgs: '<User>',
  options: [
    {
      "type": 6,
      "name": "user",
      "description": "user to get rank for",
      "required": false
    },
  ],
  run
}
