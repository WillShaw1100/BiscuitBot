const { PermissionsBitField, EmbedBuilder, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, MessageFlags } = require("discord.js");
const moment = require('moment');
const xpSchema = require("../models/xpSchema");
const generateRankImage = require("../assets/generateRankCard");

const rankRequirements = {
  rankNames: ["Starter", "Rank 2"],
  rankXPRequirements: [0, 500]
};


const run = async (client, interaction) => {
  const rankUser = interaction.options.getUser('user')


  try {

    const guildID = interaction.guild.id.toString()
    const guild = await client.guilds.fetch(guildID);
    const memberID = rankUser ? rankUser.id : interaction.member.id

    if (!guild)
      return console.log('Guild not found');

    //get_XP
    const data = await xpSchema.findOne({ Guild: guildID, Member: memberID });
    if (!data) {
      interaction.reply({
        content: "This user has sent no messages or something went wrong.",
        flags: MessageFlags.Ephemeral
      });
    } else {
      let member = data.Member;
      let messages = data.Messages
        let xp = data.XP
        //let rank = data.Rank

        // Before accessing members, fetch the guild
        const guild = await client.guilds.fetch(guildID);
        // Check if the guild is valid
        if (!guild) return console.log('Guild not found');

        // Access members of the guild

        const userFull = guild.members.cache.get(memberID) || await guild.members.fetch(memberID);
        const img = await generateRankImage(userFull, messages, xp, rankRequirements);
        //console.log(img)
        let useName = userFull.nickname ? userFull.nickname : userFull.user.username
        if (img) {
          interaction.reply({
            content: `${useName}'s rank`,//${data.Msg}`,
            files: [img]
          });
        } else {
          interaction.reply({
            content: `Failed to generate rank card`,
            flags: MessageFlags.Ephemeral
          });
        }
        //  interaction.reply(`The member ${member} has sent ${messages} messages`)
      };


  } catch (err) {
    console.error(err);
    interaction.reply({
      content: `Failed to perform this command. \n${err}`,
      flags: MessageFlags.Ephemeral
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
