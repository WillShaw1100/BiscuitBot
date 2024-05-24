const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const fetchData = require('../util/getEvents');
const moment = require('moment');

const run = async (client, interaction) => {
  try {
    const data = await fetchData();
    
    if (data && data.length > 0) {
      const targetChannel = client.channels.cache.get('589411374657175574');

      if (targetChannel) {
        const embed = new EmbedBuilder()
          .setTitle("Upcoming Events")
          .setColor("#3498db")
          

           data.map(event => {
            embed.addFields(
                {name: event.name, value: `[Join Event](https://discord.com/events/${event.guild_id}/${event.id})`},
                { name: 'Description', value: event.description },
                { name: '\u200B', value: '\u200B' },
                { name: "Date", value: moment(event.scheduled_start_time).format('DD-MM-YYYY HH:mm')},
                { name: 'Event Host', value: event.creator.username },
                { name: 'Event Host Mention', value: `<@${event.creator_id}>` },
        );
    });
          
        targetChannel.send({ embeds: [embed] });
        interaction.reply({content: "Upcoming events have been sent to the location provided.", ephemeral: true});
      } else {
        interaction.reply({content: "Unable to find the target.", ephemeral: true});
      }
    } else {
      interaction.reply({content: "No events found.", ephemeral: true});
    }
  } catch (err) {
    console.error(err);
    interaction.reply({
      content: 'Failed to perform this command',
      ephemeral: true
    });
  }
}

module.exports = {
  name: "listevents",
  type: 1,
  category: 'Events',
  description: "List Events (WIP)",
  perm: PermissionsBitField.Flags.ManageEvents,
  run
}
