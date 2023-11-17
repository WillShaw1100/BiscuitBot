const { model, Schema } = require("mongoose");

let eventChannelSchema = new Schema({
    Guild: String,
    Channel: String,
});

module.exports = model("Event_Channel", eventChannelSchema);