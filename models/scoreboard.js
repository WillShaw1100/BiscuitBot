const mongoose = require('mongoose');

const ScoreboardSchema = new mongoose.Schema({
    guildId: String,
    season: {
        type: Number,
        required: true,
        default: 1
    },
    players: [
        {
            userId: String,
            username: String,
            avatar: String,
            games: { type: [Number], default: [] },
            points: { type: [Number], default: [] }
        }
    ]
});

module.exports = mongoose.model('Scoreboard', ScoreboardSchema);
