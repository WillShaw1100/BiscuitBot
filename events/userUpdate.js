const Scoreboard = require("../models/scoreboard");

module.exports = {
    name: "userUpdate",
    async execute(oldUser, newUser) {

        // Username didn't change? Ignore.
        if (oldUser.username === newUser.username) return;

        // Find all scoreboards containing this user
        const boards = await Scoreboard.find({ "players.userId": newUser.id });

        for (const board of boards) {
            let changed = false;

            for (const p of board.players) {
                if (p.userId === newUser.id) {
                    p.username = newUser.username;
                    changed = true;
                }
            }

            if (changed) await board.save();
        }
    }
};
