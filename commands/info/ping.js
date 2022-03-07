module.exports = {
    name: "ping",
    category: "info",
    permissions: [],
    devOnly: false,
    run: async ({client, message, arsg}) => {
        message.reply("Pong")
    }
}