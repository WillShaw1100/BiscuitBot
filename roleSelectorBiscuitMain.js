require('dotenv').config();
const { Client, IntentsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const roles = [
    //Games
    {
        id: '511915827562414080',
        label: 'Pulsar',
        emoji: '🚀'
    },
    {
        id: '1171805246805266572',
        label: 'Astroneer',
        emoji: '🌒'
    },
    {
        id: '956432537335525426',
        label: 'Team Fortress 2',
        emoji: '🪖'
    },
    {
        id: '1017756855604350978',
        label: 'Elite Dangerous',
        emoji: '🌍'
    },
    {
        id: '551782067252363264',
        label: 'Minecraft',
        emoji: '⛏️'
    },
]
const roles2 = [
    {
        id: '540601114412843009',
        label: 'Garrys Mod',
        emoji: '🛠️'
    },
    {
        id: '757578326909911100',
        label: 'Among Us',
        emoji: '🥷'
    },
    {
        id: '699635411714310174',
        label: 'Arma 3',
        emoji: '🔫'
    },
    {
        id: '551024580911693824',
        label: 'Space Engineers',
        emoji: '🧑‍🚀'
    },
    {
        id: '608624267696930816',
        label: 'Left4Dead2',
        emoji: '🧟'
    },
]
const roles3 = [
    {
        id: '1174409514699739136',
        label: 'Battlefront 2',
        emoji: '⭐'
    },
    {
        id: '956432545812209664',
        label: 'Payday 2',
        emoji: '💰'
    },
    {
        id: '1143451073739247687',
        label: 'Deep Rock Galactic',
        emoji: '🪨'
    },
    {
        id: '694628701198876882',
        label: 'Unturned',
        emoji: '🧠'
    },
    {
        id: '670387464778547220',
        label: 'Colony Survival',
        emoji: '🏗️'
    },
]
const roles4 = [
    {
        id: '549249913159024650',
        label: 'Star Trek Online',
        emoji: '☄️'
    },
    {
        id: '1176883493310050415',
        label: 'Star Trek Bridge Crew',
        emoji: '💫'
    },
    {
        id: '632648604548333588',
        label: 'Mechwarrior',
        emoji: '🤖'
    },
]
//Other
const roles5 = [
    {
        id: '877144609153777694',
        label: 'PartyGames',
        emoji: '🎉'
    },
    {
        id: '967742272894558258',
        label: 'VR',
        emoji: '🥽'
    },
]
//pronouns
const roles6 = [
    {
        id: '847809820206694450',
        label: 'he/him',
        emoji: '🟠'
    },
    {
        id: '847809759507251220',
        label: 'she/her',
        emoji: '🟢'
    },
    {
        id: '847809869922566214',
        label: 'they/them',
        emoji: '🔴'
    },
    {
        id: '847809916278013993',
        label: 'ask me',
        emoji: '🔵'
    },
]
client.on('clientReady', async (c) => {
    try{
        const channel = await client.channels.cache.get('593092717458751542');
        if(!channel) return;

        const row = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();
        const row3 = new ActionRowBuilder();
        const row4 = new ActionRowBuilder();
        const row5 = new ActionRowBuilder();
        const row6 = new ActionRowBuilder();

        //Gaming Roles
        roles.forEach((role) => {
            row.components.push(
                new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary).setEmoji(role.emoji? role.emoji : "🔷")
            )
        })

        roles2.forEach((role) => {
            row2.components.push(
                new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Secondary).setEmoji(role.emoji? role.emoji : "🔷")
            )
        })
        roles3.forEach((role) => {
            row3.components.push(
                new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Success).setEmoji(role.emoji? role.emoji : "🔷")
            )
        })
        roles4.forEach((role) => {
            row4.components.push(
                new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Danger).setEmoji(role.emoji? role.emoji : "🔷")
            )
        })
        await channel.send({
            content: 'Gaming Roles',
            components: [row,row2,row3,row4]
        })

        //Other Roles
        roles5.forEach((role) => {
            row5.components.push(
                new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary).setEmoji(role.emoji? role.emoji : "🔷")
            )
        })
        await channel.send({
            content: 'Other Roles',
            components: [row5]
        })

        //Pronoun Roles
        roles6.forEach((role) => {
            row6.components.push(
                new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary).setEmoji(role.emoji? role.emoji : "🔷")
            )
        })
        await channel.send({
            content: 'Pronoun Roles',
            components: [row6]
        })

        process.exit();

    }catch(e) {
        console.log(e);
    }
});

client.login(process.env.NODE_ENV === 'dev' ? process.env.TEST_DISCORD_TOKEN : process.env.DISCORD_TOKEN);