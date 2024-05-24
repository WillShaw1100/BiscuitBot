const moment = require('moment');
const eventChannelMainSchema = require("../models/eventChannelSchema");
const { PermissionsBitField, EmbedBuilder, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require("discord.js");

const run = async (client, interaction, interactionData) => {
    //Required Modal
    const eventTitle = interaction.fields.getTextInputValue('eventNameInput')
    const eventStartDate = interaction.fields.getTextInputValue('eventStartDateInput')
    const eventStartTime = interaction.fields.getTextInputValue('eventStartTimeInput')
    const eventDescription = interaction.fields.getTextInputValue('eventDescriptionInput')
    //slash
    const eventChannel = "541642156394151936" //replace with vc channle id manually for now. Defaults to BM - Main Gaming 1
    //const eventChannel = interaction.options.getChannel('channel')

    //optional
    //modal
    const eventRequirements = interaction.fields.getTextInputValue('eventRequirementsInput')
    //slash
    let role = null; // Initialize role as null
    let eventNotifyChannel = null; // Initialize eventNotifyChannel as null

    if (interaction.options) {
        role = interaction.options.getRole('role');
        eventNotifyChannel = interaction.options.getChannel('notifychannel');
        eventChannel = interaction.options.getChannel('channel');
    }

    const dateMoment = moment(eventStartDate, 'DD/MM/YYYY', true);
    const timeMoment = moment(eventStartTime, 'HH:mm', true);

    if (!dateMoment.isValid() || !timeMoment.isValid()) {
        return interaction.reply({
            content: 'Invalid date or time format. Please use the format "DD/MM/YYYY" for date and "HH:mm" for time.',
            ephemeral: true
        });
    }

    const combinedDateTime = moment(`${eventStartDate} ${eventStartTime}`, 'DD/MM/YYYY HH:mm:00').toISOString();

    const currentTime = new Date().toISOString();

    let eventMainChannel = null
    //google calendar format

    const googleStartDateTime = moment(combinedDateTime).format('YYYYMMDDTHHmm00Z');
    const googleCreateEndDateTime = moment(combinedDateTime).add(3, 'hours');
    const googleEndDateTime = moment(googleCreateEndDateTime).format('YYYYMMDDTHHmm00Z');

    const googleTitle = eventTitle.replace(/ /g, '+');
    const googleDecription = "A+Biscuit+Mafia+event.";//eventDescription.replace(/ /g, '+');

    //create google event link
    const googleEvent = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${googleTitle}&dates=${googleStartDateTime}/${googleEndDateTime}&details=${googleDecription}`;

    ////////////////////////////////////
    try {
        //error checking
        if (combinedDateTime <= currentTime) {
            interaction.reply({
                content: 'The event start time is in the past or right now. Please choose a future time.',
                ephemeral: true
            });
            return;
        }

        const fiveYearsFromNow = new Date();
        fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);

        if (combinedDateTime > fiveYearsFromNow) {
            interaction.reply({
                content: 'The event start time is more than 5 years away. Please choose a date and time within the next 5 years.',
                ephemeral: true
            });
            return;
        }

        if (!role)
            role = null

        if (!role == null)
            if (role.id == interaction.guild.id) { //disable @ everyone notifcations
                return interaction.reply({
                    content: 'You can not send a notifcation to everyone, please select roles that apply to the event.',
                    ephemeral: true
                })
            }

        const guildID = interaction.guild.id.toString()
        const guild = await client.guilds.fetch(guildID);

        //get_Event_MASTER_Notifcation_Channel
        eventChannelMainSchema.findOne({ Guild: guildID }, async (err, data) => {
            if (!data) return;

            eventMainChannel = interaction.guild.channels.cache.get(data.Channel);
        });

        if (!guild)
            return console.log('Guild not found');

        //create event
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
        let channelMessage = `# ${eventTitle} - ${eventStartDate} ${eventStartTime} \nIn <#${eventChannel}>\n\n${eventDescription}`; //remove <# > when returning to using non hardcoded and using interaction.options

        // Add event requirements if they are supplied
        if (eventRequirements) {
            channelMessage += `\n\n**Event Requirements:**\n ${eventRequirements}`;
        }

        channelMessage += `\n\n[Join Event](https://discord.com/events/${guildID}/${createdEvent.id})\n\n[Add to Google](${googleEvent})\n\nHost: ${interaction.user.username}\nEvent ID: ||${createdEvent.id}||`

        if (eventMainChannel == null) {
            return interaction.reply({
                content: `Event Created, but No event channel exists, please ask an Administrator to set this up to start sending event messages.`,
                ephemeral: true
            })
        }
        await eventMainChannel.send(channelMessage);
        if (eventNotifyChannel) {
            // Find the notify channel by ID
            const foundNotifyChannel = interaction.guild.channels.cache.get(eventNotifyChannel.id);

            if (foundNotifyChannel) {
                // Send a notification message to the notify channel
                if (role) {
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
            content: `Failed to perform this command. \n${err}`,
            ephemeral: true
        });
    }




    /*await interaction.reply({
        content: `eventTitle: ${eventTitle}\neventStartDate: ${dateMoment}\neventStartTime: ${timeMoment}\neventDescription: ${eventDescription}\neventRequirements: ${eventRequirements}`
    });*/
    console.log(`eventTitle: ${eventTitle}\neventStartDate: ${dateMoment}\neventStartTime: ${timeMoment}\neventDescription: ${eventDescription}\neventRequirements: ${eventRequirements}`)
    /* await interaction.reply({
         content: 'event created.'
     })*/
}

module.exports = {
    name: "event",
    run
}