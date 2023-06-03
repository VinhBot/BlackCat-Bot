const mongoose = require("mongoose");

const database = new mongoose.Schema({
    GuildId: mongoose.SchemaTypes.Number,
    userId: mongoose.SchemaTypes.String,
    name: mongoose.SchemaTypes.String,
    songs: {
      url: [],
      name: []
    },
    privacy: Boolean,                                      
});

module.exports = mongoose.model("playlist", database);