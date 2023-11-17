const { Collection } = require("discord.js")
const { getFiles } = require("../util/functions");

module.exports = (bot, reload) => {
    const { client } = bot;

    let contextcommands = getFiles("./slashcommands/context/", ".js");

    if (contextcommands.length === 0) {
        console.log("No Context Commands Loaded");
    }

    contextcommands.forEach(f => {
        if (reload) delete require.cache[require.resolve(`../slashcommands/context/${f}`)];
        const contextcmd = require(`../slashcommands/context/${f}`);
        client.contextcommands.set(contextcmd.name, contextcmd);
    });
};
