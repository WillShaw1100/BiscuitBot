const { PermissionsBitField, EmbedBuilder, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require("discord.js");
const moment = require('moment');

const run = async (client, interaction) => {
    const eventTitle = (interaction.options.getString('title'))
    const eventDate = (interaction.options.getString('date'))
    const eventTime = (interaction.options.getString('time'))
    const eventChannel = (interaction.options.getChannel('channel'))
    const eventDescription = (interaction.options.getString('description'))
    //optional
    let role = (interaction.options.getRole('role'))
    const eventNotifyChannel = (interaction.options.getChannel('notifychannel'))
    const eventRequirements = (interaction.options.getString('requirements'))

    const dateMoment = moment(eventDate, 'DD/MM/YYYY', true);
    const timeMoment = moment(eventTime, 'HH:mm', true);

    if (!dateMoment.isValid() || !timeMoment.isValid()) {
        return interaction.reply({ content: 'Invalid date or time format. Please use the format "DD/MM/YYYY" for date and "HH:mm" for time.',
        ephemeral: true});
    }

    const combinedDateTime = moment(`${eventDate} ${eventTime}`, 'DD/MM/YYYY HH:mm:00').toISOString();

    const currentTime = new Date().toISOString();

    //google calendar format

    const googleStartDateTime = moment(combinedDateTime).format('YYYYMMDDTHHmm00Z');
    const googleCreateEndDateTime = moment(combinedDateTime).add(3, 'hours');
    const googleEndDateTime = moment(googleCreateEndDateTime).format('YYYYMMDDTHHmm00Z');

    const googleTitle = eventTitle.replace(/ /g, '+');
    const googleDecription = eventDescription.replace(/ /g, '+');
    
    //create google event link
    const googleEvent = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${googleTitle}&dates=${googleStartDateTime}/${googleEndDateTime}&details=${googleDecription}`;


  try {
    //error checking
    if (combinedDateTime <= currentTime) {
        interaction.reply({content: 'The event start time is in the past or right now. Please choose a future time.',
        ephemeral: true});
        return;
    }

    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
    
    if (combinedDateTime > fiveYearsFromNow) {
    interaction.reply({content: 'The event start time is more than 5 years away. Please choose a date and time within the next 5 years.',
    ephemeral: true});
    return;
}

    if(!role)
    role = null
        //return interaction.reply('Unknown Role')
        if(!role == null)
        if( role.id == interaction.guild.id) { //disable @ everyone notifcations
            return interaction.reply({content: 'You can not send a notifcation to everyone, please select roles that apply to the event.',
            ephemeral: true
        })
    }

    if (eventTitle.length > 99) {
        return interaction.reply({
            content: 'Event title cannot be more than 99 characters.',
            ephemeral: true
        });
    }
    if (eventDescription.length > 600) {
        return interaction.reply({
            content: 'Event description cannot be more than 600 characters.',
            ephemeral: true
        });
    }

    if (eventRequirements.length > 150) {
        return interaction.reply({
            content: 'Event requirements cannot be more than 150 characters.',
            ephemeral: true
        });
    }

    const guildID = interaction.guild.id.toString()
    const guild = await client.guilds.fetch(guildID);

    const whatsOnChannel = guild.channels.cache.get('1171168027946012743') //channel to additionally send message to.

    if (!guild)
      return console.log('Guild not found');

    const eventManager = new GuildScheduledEventManager(guild)

    const createdEvent = await eventManager.create({
        name: eventTitle,
        scheduledStartTime: combinedDateTime,
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.Voice,
        description: eventDescription,
        channel: eventChannel,
        image: null,
        reason: 'Automated Event Creation - Biscuit Bot'
    })

    //taylor message
    let channelMessage = `***${eventTitle} - ${eventDate} ${eventTime}***\nIn ${eventChannel}\n\n${eventDescription}`;

    // Add event requirements if they are supplied
    if (eventRequirements) {
        channelMessage += `\n\n**Event Requirements:**\n ${eventRequirements}`;
    }

    channelMessage += `\n\n[Join Event](https://discord.com/events/${guildID}/${createdEvent.id})\n\n[Add to Google](${googleEvent})\n\nHost: ${interaction.user.username}\nEvent ID: ||${createdEvent.id}||`

    if(whatsOnChannel){
        await whatsOnChannel.send(channelMessage);
        }

        if (eventNotifyChannel) {
            // Find the notify channel by ID
            const foundNotifyChannel = interaction.guild.channels.cache.get(eventNotifyChannel.id);
    
            if (foundNotifyChannel) {
                // Send a notification message to the notify channel
                if(role){
                    channelMessage += `\nNotify: <@&${role.id}>`
                }
                await foundNotifyChannel.send(channelMessage);
            } else {
                console.log('Notify Channel not found');
            }
        }
       

    interaction.reply({
        content: `Event created Successfully.`,
        ephemeral: true
    })

//scheduledEndTime: null,

  } catch (err) {
    console.error(err);
    interaction.reply({
      content: 'Failed to perform this command',
      ephemeral: true
    });
  }
}

module.exports = {
  name: "event",
  type: 1,
  category: 'Events',
  description: "Create an Event",
  perm: PermissionsBitField.Flags.ManageEvents,
  expectedArgs: '<Title> <date> <time> <channel> <description> <role> <notifychannel>',
   options: [
    {
        "type": 3,
        "name": "title",
        "description": "title of the event",
        "required": true
    },
    {
        "type": 3,
        "name": "date",
        "description": "the start date in dd/mm/yyyy",
        "required": true
    },
    {
        "type": 3,
        "name": "time",
        "description": "the start time in hh:mm",
        "required": true
    },
    {
        "type": 7,
        "name": "channel",
        "description": "relevent voice channel",
        "channel_types": [2],
        "required": true
    },
    {
        "type": 3,
        "name": "description",
        "description": "event description",
        "required": true
    },
    {
        "type": 3,
        "name": "requirements",
        "description": "requirements, comma seperated",
        "required": false
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
        "channel_types": [0,5],
        "required": false
    },
],
  run
}
