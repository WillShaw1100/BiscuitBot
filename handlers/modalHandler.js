const fs = require("fs")

const getFiles = (path, ending) => {
    return fs.readdirSync(path).filter((f) => f.endsWith(ending))
}

module.exports = (bot, reload) => {
    const { client } = bot

    let modals = getFiles("./modals/", ".js")

    if (modals.legnth === 0) {
        console.log("No modals to load")
    }

    modals.forEach((f, i) => {
        if (reload) delete require.cache[require.resolve(`../modals/${f}`)]
        const modal = require(`../modals/${f}`)

        client.modals.set(modal.name, modal)
    })
}