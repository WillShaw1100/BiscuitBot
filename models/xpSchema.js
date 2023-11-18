const { model, Schema } = require("mongoose");

let xpSchema = new Schema({
    Guild: String,
    Member: String,
    Messages: Number,
    XP: Number,
});

module.exports = model("XP", xpSchema);