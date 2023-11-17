const { getFiles } = require("../util/functions")

module.exports = (bot, reload) => {
    const {client} = bot

    let events = getFiles("./events/", ".js")

    if (events.length === 0){
        console.log("No events to load")
    }
    events.forEach((f, i) => {
        if(reload)
        delete require.cache[require.resolve(`../events/${f}`)]
        const event = require(`../events/${f}`)
        client.events.set(event.name, event)

        if(!reload)
        console.log(`${i + 1}. ${f} loaded`)
    })
    if(!reload)
    initEvents(bot)
}

function triggerEventHandler(bot, event, ...args){
    const {client} = bot

    try {
        if(client.events.has(event))
            client.events.get(event).run(bot, ...args)
        else
            throw new Error(`Event ${event} does not exist`)
    }
    catch(err){
        console.error(err)
    }
}


function initEvents(bot){
    const {client} = bot

    client.on("ready", () => {
        triggerEventHandler(bot, "ready")
        var stat = 'The Biscuit Mafia'
        client.user.setActivity(stat, {type: "WATCHING"});
    })

    client.on("messageCreate", (message) =>{
        triggerEventHandler(bot, "messageCreate", message)
    })
    
    client.on('guildMemberAdd', member => {
        let eventFile = require(`../events/guildMemberAdd.js`);
        eventFile.run(client, member);
    })

    client.on('interactionCreate', member => {
        let eventFile = require(`../events/interactionCreate.js`);
        eventFile.run(client, member);
    })

    /*client.on('guildMemberLeave', member => {
        let eventFile = require(`../events/guildMemberLeave.js`);
        eventFile.run(client, member);
})*/
}