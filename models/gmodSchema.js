const { model, Schema } = require("mongoose");

let GModSchema = new Schema({
    Guild: String,
    Member: String,
    ID: String,
    Season: Number,
    Round: Number,
    TraitorWins: Number,
});

module.exports = model("GMod", GModSchema);