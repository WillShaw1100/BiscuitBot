const { model, Schema } = require("mongoose");

let xpSchema = new Schema({
    Guild: String,
    Member: String,
    Messages: Number,
    XP: Number,
    Rank: String,
});

module.exports = model("XP", xpSchema);