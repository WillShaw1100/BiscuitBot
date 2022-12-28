const { Channel, Message } = require("discord.js")

const run = async (client, interaction) => {
    let replies = ['rock', 'paper', 'scissors'];
    let result = Math.floor((Math.random() * replies.length));
    const args = (interaction.options.getString('text')).toLowerCase();
    const arr = args.split(" ", 2);
    let guess = arr[0]
    if(!replies.includes(guess)) return interaction.reply('Please select Rock, Paper or Scissors')
    try{
        if (replies[result] === guess) {
            return interaction.reply('It\'s a tie! We had the same choice.');
        } else if (guess === 'rock') {
            if (replies[result] === 'paper') return interaction.reply('I won!');
            else return interaction.reply('You won!');
        } else if (guess === 'scissors') {
            if (replies[result] === 'rock') return interaction.reply('I won!');
            else return interaction.reply('You won!');
        } else if (guess === 'paper') {
            if (replies[result] === 'scissors') return interaction.reply('I won!');
            else return interaction.reply('You won!');
        }
    }catch(err){
    if (err){
        console.error(err)
        return interaction.reply('Failed to perform this command')
    }

}
}

module.exports = {
    name: "rps",
    type: 1,
    category: 'Fun',
    description: "Play Rock, Paper, Scissors",
    perm: "",
    maxArgs: 1,
    expectedArgs: '<text>',
    options: [
        {
            name: "text", description: "Rock, Paper or Scissors?",
            type: 3,
            required: true
        }
    ],
    run
}