const { model, Schema } = require("mongoose");

let birthdaySchema = new Schema({
    Guild: String,
    Member: String,
    Date: Date,
});

module.exports = model("birthday", birthdaySchema);