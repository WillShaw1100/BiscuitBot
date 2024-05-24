const Discord = require("discord.js")
const xpSchema = require("../models/xpSchema");

/*const ranks = [
    { name: "Starter", xpRequirement: 0 },
    { name: "Rank 2", xpRequirement: 500 },
    // Add more ranks as needed
];*/

module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        const { client, prefix, owners } = bot
        if (!message.guild) return

        if (message.author.bot) return
        let member = message.member
        let guildId = message.guild.id;

        try {
            xpSchema.findOne({ Guild: guildId }, async (err, data) => {
                if (!data) {
                    await xpSchema.create({
                        Guild: guildId,
                        Member: member.id,
                        Messages: 1,
                        XP: 0,
                        Rank: "Starter"
                    });
                } else if (data) {
                    const xpGain = (Math.random() * (1.2 - 0.2) + 0.2).toFixed(1);
                    await xpSchema.updateOne({ Messages: data.Messages + 1, XP: (Number(data.XP) + Number(xpGain)).toFixed(2) });

                    // const newRank = ranks.find(rank => (data.XP + xpGain) >= rank.xpRequirement) || { name: "N/A" };

                    //await xpSchema.updateOne({ Rank: newRank.name });
                }
            })
        } catch (err) {
            console.log(err);
            message.reply("Something went wrong. Please contact the developer.")
        }


        if (!message.content.startsWith(prefix)) return


        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        const cmdstr = args.shift().toLowerCase()

        let command = client.commands.get(cmdstr)
        if (!command) return



        if (command.devOnly && !owners.includes(member.id)) {
            return message.reply("This command is only available to the Bot Management Team")
        }
        if (command.permissions && member.permissions.missing(command.permissions).length !== 0) {
            return message.reply({ content: "You do not have permission for this command", ephemeral: true })
        }

        try {
            await command.run({ ...bot, message, args })
        }
        catch (err) {
            let errMsg = err.toString()

            if (errMsg.startsWith("?")) {
                errMsg = errMsg.slice(1)
                await message.reply(errMsg)
            }
            else
                console.error(err)
        }
    }
}