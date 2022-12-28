const { Channel, Message, EmbedBuilder } = require("discord.js")
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
//workaround to import node-fetch

const run = async (client, interaction) => {
    const { guild, options, member } = interaction;

    const platform = options.getString("platform");

    const memeEmbed = new EmbedBuilder();

    async function redditMeme() {
        await fetch('https://www.reddit.com/r/memes/random/.json').then(async res => {
            let meme = await res.json();

            console.log(meme);

            let title = meme[0].data.children[0].data.title;
            let url = meme[0].data.children[0].data.url;
            let author = meme[0].data.children[0].data.author;

            return interaction.reply({ embeds: [memeEmbed.setTitle(title).setImage(url).setURL(url).setColor("Random").setFooter({ text: author })] });
        });
    }

    async function giphyMeme() {
        await fetch('https://api.giphy.com/v1/gifs/random?api_key=lYBciWOvaOhVPNzGy4J8mUXNpC53YNbz&tag=&rating=g').then(async res => {
            let meme = await res.json();

            let title = meme.data.title;
            let url = meme.data.images.original.url;
            let link = meme.data.url;
            let author = meme.data.user.display_name;
            let pf = meme.data.user.avatar_url;

            return interaction.reply({
                embeds: [memeEmbed.setTitle(`${title}`).setImage(`${url}`).setURL(link).setColor("Random").setFooter({ text: author, iconURL: pf })],
            });
        });
    }

    try{
        if (platform === "reddit") {
            redditMeme();
        }

        if (platform === "giphy") {
            giphyMeme();
        }

        //generating a random meme from any platform
        if (!platform) {
            let memes = [giphyMeme, redditMeme];
            memes[Math.floor(Math.random() * memes.length)]();
        }        

    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }

}
}

module.exports = {
    name: "meme",
    type: 1,
    category: 'Fun',
    description: "Send a Meme",
    perm: "",
    expectedArgs: '<platform>',
    options: [
        {
            name: "platform", description: "Meme platform (optional)",
            type: 3,
            required: false,
            choices: [
                {
                    name: "Reddit",
                    value: "redit"
                },
                {
                    name: "Giphy",
                    value: "giphy"                    
                }
            ]
        }
    ],
    run
}