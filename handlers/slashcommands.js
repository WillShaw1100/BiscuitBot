const { Collection } = require("discord.js")
const { getFiles } = require("../util/functions");

module.exports = (bot, reload) => {
    const { client } = bot;

    let slashcommands = getFiles("./slashcommands/", ".js");

    if (slashcommands.length === 0) {
        console.log("No Slash Commands Loaded");
    }

    slashcommands.forEach(f => {
        if (reload) delete require.cache[require.resolve(`../slashcommands/${f}`)];
        const slashcmd = require(`../slashcommands/${f}`);
        client.slashcommands.set(slashcmd.name, slashcmd);
    });
};
